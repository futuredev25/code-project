<?php
// config.php
session_start();

// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'theroyce_db');
define('DB_USER', 'root'); // À changer selon votre configuration
define('DB_PASS', ''); // À changer selon votre configuration

// Configuration du site
define('SITE_URL', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]");
define('SITE_PATH', dirname(__FILE__));
define('UPLOAD_DIR', SITE_PATH . '/uploads/');
define('UPLOAD_URL', SITE_URL . '/uploads/');
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB

// Types de fichiers autorisés
define('ALLOWED_IMAGE_TYPES', [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
    'image/svg+xml' => 'svg'
]);

// Connexion à la base de données avec gestion d'erreurs
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            // Vérifier si les tables existent
            checkDatabaseTables($pdo);
            
        } catch(PDOException $e) {
            error_log("Erreur de connexion à la base de données: " . $e->getMessage());
            die(json_encode([
                'success' => false,
                'error' => 'Erreur de connexion à la base de données',
                'debug' => DEBUG_MODE ? $e->getMessage() : null
            ]));
        }
    }
    
    return $pdo;
}

// Vérifier et créer les tables si nécessaire
function checkDatabaseTables($pdo) {
    try {
        // Vérifier si la table settings existe et contient le code admin
        $stmt = $pdo->query("SHOW TABLES LIKE 'settings'");
        if ($stmt->rowCount() == 0) {
            // Créer les tables si elles n'existent pas
            $sql = file_get_contents(__DIR__ . '/sql/database.sql');
            $pdo->exec($sql);
        } else {
            // Vérifier si le code admin existe
            $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = 'admin_code'");
            $stmt->execute();
            if ($stmt->rowCount() == 0) {
                // Insérer le code admin par défaut
                $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('admin_code', '123456')")->execute();
            }
        }
    } catch (Exception $e) {
        error_log("Erreur vérification tables: " . $e->getMessage());
    }
}

// Vérifier si admin est connecté
function isAdminLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// Sécuriser les données
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Générer un nom de fichier unique
function generateFileName($originalName) {
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $name = pathinfo($originalName, PATHINFO_FILENAME);
    $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
    return $safeName . '_' . uniqid() . '_' . time() . '.' . $extension;
}

// Upload d'image avec gestion améliorée
function uploadImage($file, $type = 'product') {
    // Vérifier les erreurs
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'Le fichier dépasse la limite de taille du serveur',
            UPLOAD_ERR_FORM_SIZE => 'Le fichier dépasse la limite de taille du formulaire',
            UPLOAD_ERR_PARTIAL => 'Le fichier n\'a été que partiellement téléchargé',
            UPLOAD_ERR_NO_FILE => 'Aucun fichier n\'a été téléchargé',
            UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
            UPLOAD_ERR_CANT_WRITE => 'Échec de l\'écriture du fichier sur le disque',
            UPLOAD_ERR_EXTENSION => 'Une extension PHP a arrêté le téléchargement'
        ];
        
        return [
            'success' => false,
            'error' => $errorMessages[$file['error']] ?? 'Erreur inconnue'
        ];
    }
    
    // Vérifier la taille
    if ($file['size'] > MAX_FILE_SIZE) {
        return [
            'success' => false,
            'error' => 'Fichier trop volumineux (max ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB)'
        ];
    }
    
    // Vérifier le type MIME
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!array_key_exists($mime, ALLOWED_IMAGE_TYPES)) {
        return [
            'success' => false,
            'error' => 'Type de fichier non autorisé. Types acceptés: ' . implode(', ', array_keys(ALLOWED_IMAGE_TYPES))
        ];
    }
    
    // Créer le dossier uploads s'il n'existe pas
    if (!file_exists(UPLOAD_DIR)) {
        if (!mkdir(UPLOAD_DIR, 0755, true)) {
            return [
                'success' => false,
                'error' => 'Impossible de créer le dossier uploads'
            ];
        }
    }
    
    // Créer le sous-dossier par type
    $typeDir = UPLOAD_DIR . $type . '/';
    if (!file_exists($typeDir)) {
        if (!mkdir($typeDir, 0755, true)) {
            return [
                'success' => false,
                'error' => "Impossible de créer le dossier $type"
            ];
        }
    }
    
    // Générer un nom unique sécurisé
    $fileName = generateFileName($file['name']);
    $filePath = $typeDir . $fileName;
    
    // Déplacer le fichier
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        // Redimensionner l'image si nécessaire (optionnel)
        resizeImageIfNeeded($filePath, 800, 600);
        
        return [
            'success' => true,
            'path' => 'uploads/' . $type . '/' . $fileName,
            'url' => UPLOAD_URL . $type . '/' . $fileName,
            'filename' => $fileName
        ];
    }
    
    return [
        'success' => false,
        'error' => 'Erreur lors du déplacement du fichier'
    ];
}

// Redimensionner l'image (optionnel)
function resizeImageIfNeeded($filePath, $maxWidth = 800, $maxHeight = 600) {
    try {
        list($width, $height, $type) = getimagesize($filePath);
        
        if ($width <= $maxWidth && $height <= $maxHeight) {
            return true;
        }
        
        $ratio = $width / $height;
        
        if ($width > $height) {
            $newWidth = $maxWidth;
            $newHeight = $maxWidth / $ratio;
        } else {
            $newHeight = $maxHeight;
            $newWidth = $maxHeight * $ratio;
        }
        
        switch ($type) {
            case IMAGETYPE_JPEG:
                $image = imagecreatefromjpeg($filePath);
                break;
            case IMAGETYPE_PNG:
                $image = imagecreatefrompng($filePath);
                break;
            case IMAGETYPE_GIF:
                $image = imagecreatefromgif($filePath);
                break;
            case IMAGETYPE_WEBP:
                $image = imagecreatefromwebp($filePath);
                break;
            default:
                return false;
        }
        
        $newImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Conserver la transparence pour PNG et GIF
        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
            imagecolortransparent($newImage, imagecolorallocatealpha($newImage, 0, 0, 0, 127));
            imagealphablending($newImage, false);
            imagesavealpha($newImage, true);
        }
        
        imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($newImage, $filePath, 85);
                break;
            case IMAGETYPE_PNG:
                imagepng($newImage, $filePath, 9);
                break;
            case IMAGETYPE_GIF:
                imagegif($newImage, $filePath);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($newImage, $filePath, 85);
                break;
        }
        
        imagedestroy($image);
        imagedestroy($newImage);
        
        return true;
    } catch (Exception $e) {
        error_log("Erreur redimensionnement image: " . $e->getMessage());
        return false;
    }
}

// Convertir base64 en fichier
function saveBase64Image($base64, $type = 'product') {
    if (empty($base64)) {
        return ['success' => false, 'error' => 'Données image vides'];
    }
    
    // Extraire les données base64
    if (preg_match('/^data:image\/(\w+);base64,/', $base64, $matches)) {
        $imageType = $matches[1];
        $base64 = substr($base64, strpos($base64, ',') + 1);
    } else {
        $imageType = 'jpg';
    }
    
    // Décoder l'image
    $imageData = base64_decode($base64);
    if ($imageData === false) {
        return ['success' => false, 'error' => 'Image base64 invalide'];
    }
    
    // Vérifier la taille
    if (strlen($imageData) > MAX_FILE_SIZE) {
        return ['success' => false, 'error' => 'Image trop volumineuse'];
    }
    
    // Créer le dossier
    $typeDir = UPLOAD_DIR . $type . '/';
    if (!file_exists($typeDir)) {
        if (!mkdir($typeDir, 0755, true)) {
            return ['success' => false, 'error' => 'Impossible de créer le dossier'];
        }
    }
    
    // Générer un nom de fichier
    $fileName = uniqid() . '_' . time() . '.' . $imageType;
    $filePath = $typeDir . $fileName;
    
    // Sauvegarder le fichier
    if (file_put_contents($filePath, $imageData)) {
        // Redimensionner si nécessaire
        resizeImageIfNeeded($filePath);
        
        return [
            'success' => true,
            'path' => 'uploads/' . $type . '/' . $fileName,
            'url' => UPLOAD_URL . $type . '/' . $fileName,
            'filename' => $fileName
        ];
    }
    
    return ['success' => false, 'error' => 'Erreur lors de l\'enregistrement'];
}

// Fonction de débogage
function debug($data, $die = false) {
    echo '<pre>';
    print_r($data);
    echo '</pre>';
    if ($die) die();
}

// Gestion des erreurs
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        echo json_encode([
            'success' => false,
            'error' => "Erreur: $errstr",
            'file' => $errfile,
            'line' => $errline
        ]);
        die();
    }
});

// Activer le mode débogage en local
define('DEBUG_MODE', $_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['REMOTE_ADDR'] === '127.0.0.1');
?>