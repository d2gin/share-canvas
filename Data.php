<?php

class Data
{
    public $type = '';
    public $data = null;
    public $code = 0;

    static function fromJson($data)
    {
        if (is_string($data)) {
            $data = json_decode($data, true);
        }
        $instance = new static();
        if (!$data) return $instance;
        $instance->type = $data['type'] ?? '';
        $instance->data = $data['data'] ?? '';
        $instance->code = $data['code'] ?? 0;
        return $instance;
    }

    static function fromArray($data)
    {
        $instance = new static();
        if (!$data) return $instance;
        $instance->type = $data['type'] ?? '';
        $instance->data = $data['data'] ?? '';
        $instance->code = $data['code'] ?? 0;
        return $instance;
    }

    public function __toString()
    {
        return json_encode($this);
    }
}
