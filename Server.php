<?php
include __DIR__ . '/Data.php';

use Workerman\Connection\TcpConnection;
use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;
use \Workerman\Worker;

class Server
{
    /* @var Worker $worker */
    protected $worker;
    protected $rooms           = [];
    protected $roomSubscribers = [];

    public function run()
    {
        $worker = new Worker('websocket://0.0.0.0:5520');
        //
        $worker->onWorkerStart = function ($worker) {
            $http            = new Worker('http://0.0.0.0:12017');
            $http->onMessage = [$this, 'handleHttpClient'];
            $http->listen();
        };
        $worker->onMessage     = function (TcpConnection $connection, $data) {
            $data = Data::fromJson($data);
            if (substr($data->type, 0, 7) == 'system-') {
                switch ($data->type) {
                    case 'system-create-room':
                        $this->createRoom($data->data, $connection);
                        break;
                    case 'system-subcribe-room':
                        $this->subcribeRoom($data->data, $connection);
                        break;
                    case 'system-unsubcribe-room':
                        $this->unSubcribeRoom($connection);
                        break;
                }
            } else $this->broadcastRoom($data, $connection->id);
        };
        $worker->onClose       = function (TcpConnection $connection) {
            foreach ($this->rooms as $key => $room) {
                if ($connection->id === $room['id']) {
                    $this->broadcastRoom((string)Data::fromArray(['type' => 'system-room-close']), $room['id']);
                    unset($this->rooms[$key]);
                    // 踢掉观众
                    if (isset($this->roomSubscribers[$room['id']])) {
                        // 通知房间已关闭
                        unset($this->roomSubscribers[$room['id']]);
                    }
                }
            }
            // 订阅者
            foreach ($this->roomSubscribers as $key => $roomSubscriber) {
                if (isset($this->roomSubscribers[$key][$connection->id])) {
                    unset($this->roomSubscribers[$key][$connection->id]);
                }
            }
        };
        $this->worker          = $worker;
        Worker::runAll();
    }

    public function broadcast($data, $exclude = [])
    {
        $connections = $this->worker->connections;
        /* @var TcpConnection $connection */
        foreach ($connections as $connection) {
            if (in_array($connection->id, $exclude)) continue;
            $connection->send((string)$data);
        }
    }

    public function broadcastRoom($data, $roomId)
    {
        $connections = $this->worker->connections;
        $subcribers  = array_column($this->roomSubscribers[$roomId] ?? [], 'client_id');
        /* @var TcpConnection $connection */
        foreach ($connections as $connection) {
            if (in_array($connection->id, $subcribers)) {
                $connection->send((string)$data);
            }
        }
    }

    function handleHttpClient(TcpConnection $connection, Request $request)
    {
        $data = Data::fromJson($request->post());
        switch ($data->type) {
            case 'system-get-rooms':
                $response = new Response();
                $response->withBody((string)Data::fromArray(['data' => $this->rooms]));
                $response->withHeader('Content-Type', 'application/json');
                $connection->close($response);
                break;
        }
        $connection->close("error");
    }

    public function createRoom($data, $connection)
    {
        $roomName = $data['name'] ?? '画室' . $connection->id;
        //
        $this->rooms[$connection->id] = [
            'id'             => $connection->id,
            'name'           => $roomName,
            'total_audience' => 0,
        ];
        $this->updateRooms();
    }

    public function updateRooms($broadcast = true)
    {
        foreach ($this->rooms as &$room) {
            if (isset($this->roomSubscribers[$room['id']])) {
                $room['total_audience'] = count($this->roomSubscribers[$room['id']]);
            }
        }
        $this->broadcast(Data::fromArray(['type' => 'system-rooms-update']));
    }

    public function subcribeRoom($data, $connetion)
    {
        $roomId = $data['id'];
        if (!$roomId) return;
        if (!isset($this->roomSubscribers[$roomId])) {
            $this->roomSubscribers[$roomId] = [];
        }
        $this->roomSubscribers[$roomId][$connetion->id] = [
            'room_id'   => $roomId,
            'client_id' => $connetion->id,
        ];
        $this->updateRooms();
    }

    public function unSubcribeRoom($connection)
    {
        foreach ($this->roomSubscribers as $key => $roomSubscriber) {
            if (isset($this->roomSubscribers[$key][$connection->id])) {
                unset($this->roomSubscribers[$key][$connection->id]);
            }
        }
        $this->updateRooms();
    }
}
