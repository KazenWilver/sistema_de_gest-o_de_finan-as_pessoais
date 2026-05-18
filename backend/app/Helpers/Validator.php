<?php
/**
 * SGFP — Validator.php
 * Input validation utilities.
 */

class Validator
{
    private array $errors = [];

    /**
     * Validate data against rules
     * Returns true if valid, false otherwise
     */
    public function validate(array $data, array $rules): bool
    {
        $this->errors = [];

        foreach ($rules as $field => $ruleSet) {
            $ruleList = is_string($ruleSet) ? explode('|', $ruleSet) : $ruleSet;
            $value = $data[$field] ?? null;

            foreach ($ruleList as $rule) {
                $params = [];
                if (strpos($rule, ':') !== false) {
                    [$rule, $paramStr] = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                }

                $error = $this->checkRule($field, $value, $rule, $params, $data);
                if ($error) {
                    $this->errors[$field] = $error;
                    break; // One error per field
                }
            }
        }

        return empty($this->errors);
    }

    /**
     * Get validation errors
     */
    public function errors(): array
    {
        return $this->errors;
    }

    /**
     * Check a single validation rule
     */
    private function checkRule(string $field, $value, string $rule, array $params, array $data): ?string
    {
        switch ($rule) {
            case 'required':
                if ($value === null || $value === '') {
                    return "O campo $field é obrigatório.";
                }
                break;

            case 'email':
                if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return "O campo $field deve ser um email válido.";
                }
                break;

            case 'min':
                $min = (int) ($params[0] ?? 0);
                if (is_string($value) && strlen($value) < $min) {
                    return "O campo $field deve ter pelo menos $min caracteres.";
                }
                if (is_numeric($value) && $value < $min) {
                    return "O campo $field deve ser pelo menos $min.";
                }
                break;

            case 'max':
                $max = (int) ($params[0] ?? 255);
                if (is_string($value) && strlen($value) > $max) {
                    return "O campo $field não pode exceder $max caracteres.";
                }
                if (is_numeric($value) && $value > $max) {
                    return "O campo $field não pode exceder $max.";
                }
                break;

            case 'numeric':
                if ($value !== null && $value !== '' && !is_numeric($value)) {
                    return "O campo $field deve ser numérico.";
                }
                break;

            case 'in':
                if ($value !== null && !in_array($value, $params)) {
                    return "O campo $field deve ser um dos valores: " . implode(', ', $params);
                }
                break;

            case 'date':
                if ($value && !strtotime($value)) {
                    return "O campo $field deve ser uma data válida.";
                }
                break;

            case 'confirmed':
                $confirmField = $field . '_confirmation';
                if (($data[$confirmField] ?? null) !== $value) {
                    return "A confirmação de $field não coincide.";
                }
                break;
        }

        return null;
    }
}
