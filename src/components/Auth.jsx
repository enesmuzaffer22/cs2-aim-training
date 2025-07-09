import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Giriş yap
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate("/menu");
        } else {
          setError(getErrorMessage(result.error));
        }
      } else {
        // Kayıt ol
        if (formData.password !== formData.confirmPassword) {
          setError("Şifreler eşleşmiyor");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Şifre en az 6 karakter olmalıdır");
          setLoading(false);
          return;
        }

        const result = await register(
          formData.email,
          formData.password,
          formData.displayName
        );
        if (result.success) {
          navigate("/menu");
        } else {
          setError(getErrorMessage(result.error));
        }
      }
    } catch {
      setError("Bir hata oluştu");
    }

    setLoading(false);
  };

  const getErrorMessage = (error) => {
    switch (error) {
      case "Firebase: Error (auth/email-already-in-use).":
        return "Bu e-posta adresi zaten kullanımda";
      case "Firebase: Error (auth/weak-password).":
        return "Şifre çok zayıf";
      case "Firebase: Error (auth/invalid-email).":
        return "Geçersiz e-posta adresi";
      case "Firebase: Error (auth/user-not-found).":
        return "Kullanıcı bulunamadı";
      case "Firebase: Error (auth/wrong-password).":
        return "Yanlış şifre";
      case "Firebase: Error (auth/invalid-credential).":
        return "Geçersiz kullanıcı bilgileri";
      default:
        return error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎯 CS2 Aim Training
          </h1>
          <h2 className="text-xl text-gray-300">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                İsim
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isLogin}
                placeholder="Adınızı girin"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              E-posta
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Şifre
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="En az 6 karakter"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isLogin}
                placeholder="Şifreyi tekrar girin"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                İşleniyor...
              </div>
            ) : isLogin ? (
              "Giriş Yap"
            ) : (
              "Kayıt Ol"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({
                email: "",
                password: "",
                displayName: "",
                confirmPassword: "",
              });
            }}
            className="text-blue-400 hover:text-blue-300 transition duration-300"
          >
            {isLogin
              ? "Hesabınız yok mu? Kayıt olun"
              : "Zaten hesabınız var mı? Giriş yapın"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
