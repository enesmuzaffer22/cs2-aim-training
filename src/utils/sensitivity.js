// CS2 Sensitivity Calculation Utilities
// Docs'a göre: Dönüş Açısı (derece) = Mouse Hareketi * Sensitivity * Yaw

const CS2_YAW = 0.022; // Source 2 engine için sabit yaw değeri

/**
 * CS2 sensitivity'sine göre mouse movement'ını rotation angle'a çevirir
 * @param {number} mouseMovement - Mouse hareket miktarı (piksel)
 * @param {number} sensitivity - CS2 sensitivity değeri
 * @returns {number} - Rotation angle (derece)
 */
export function calculateRotationAngle(mouseMovement, sensitivity) {
  return mouseMovement * sensitivity * CS2_YAW;
}

/**
 * Tarayıcıdaki mouse movement'ını CS2 sensitivity'sine göre normalize eder
 * @param {number} movementX - Mouse X ekseni hareketi
 * @param {number} movementY - Mouse Y ekseni hareketi
 * @param {number} sensitivity - CS2 sensitivity değeri
 * @returns {object} - {rotationX, rotationY} derece cinsinden
 */
export function calculateCS2Movement(movementX, movementY, sensitivity) {
  // Web tarayıcısında mouse movement zaten piksel cinsinden
  // CS2 formülüne göre direkt hesaplama yapıyoruz

  const rotationX = calculateRotationAngle(movementX, sensitivity);
  const rotationY = calculateRotationAngle(movementY, sensitivity);

  return {
    rotationX,
    rotationY,
  };
}

/**
 * LocalStorage'dan sensitivity ayarlarını yükler
 * @returns {object} - {sensitivity, dpi}
 */
export function loadSensitivitySettings() {
  const sensitivity =
    parseFloat(localStorage.getItem("cs2_sensitivity")) || 1.0;
  const dpi = parseInt(localStorage.getItem("cs2_dpi")) || 800;

  return { sensitivity, dpi };
}

/**
 * Sensitivity ayarlarını localStorage'a kaydet
 * @param {number} sensitivity - CS2 sensitivity değeri
 * @param {number} dpi - Mouse DPI değeri
 */
export function saveSensitivitySettings(sensitivity, dpi) {
  localStorage.setItem("cs2_sensitivity", sensitivity.toString());
  localStorage.setItem("cs2_dpi", dpi.toString());
}

/**
 * Effective DPI hesaplar (sensitivity * dpi)
 * @param {number} sensitivity - CS2 sensitivity değeri
 * @param {number} dpi - Mouse DPI değeri
 * @returns {number} - Effective DPI
 */
export function calculateEffectiveDPI(sensitivity, dpi) {
  return sensitivity * dpi;
}
