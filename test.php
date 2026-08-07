<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$input = '{"fullName": "Test", "emailAddress": "test@example.com", "message": "This is a test message over 10 chars."}';

// mock php://input
stream_wrapper_unregister("php");
class MockPhpStream {
    private $position = 0;
    private $data = '{"fullName": "Test", "emailAddress": "test@example.com", "message": "This is a test message over 10 chars."}';
    public function stream_open($path, $mode, $options, &$opened_path) { return true; }
    public function stream_read($count) {
        $ret = substr($this->data, $this->position, $count);
        $this->position += strlen($ret);
        return $ret;
    }
    public function stream_eof() { return $this->position >= strlen($this->data); }
    public function stream_stat() { return []; }
}
stream_wrapper_register("php", "MockPhpStream");

include 'public/api/contact.php';
