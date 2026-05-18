<?php
/**
 * SGFP — Response.php
 * Standardized JSON response helpers.
 */

class Response
{
    /**
     * Send a success JSON response
     */
    public static function json($data, int $code = 200, string $message = ''): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');

        $response = ['status' => 'success', 'data' => $data];
        if ($message) $response['message'] = $message;

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send an error JSON response
     */
    public static function error(string $message, int $code = 400, array $errors = []): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');

        $response = ['status' => 'error', 'message' => $message];
        if (!empty($errors)) $response['errors'] = $errors;

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send a file download response
     */
    public static function download(string $content, string $filename, string $contentType): void
    {
        http_response_code(200);
        header("Content-Type: $contentType");
        header("Content-Disposition: attachment; filename=\"$filename\"");
        header('Content-Length: ' . strlen($content));
        echo $content;
        exit;
    }
}
