import { Route, Routes } from "react-router-dom";
import Home from "./components/home/Home";
import Footer from "./components/_utils/Footer";
import NotFound from "./components/_utils/NotFound";
import Header from "./components/_utils/Header";
import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import EditModeBar from "./components/_utils/EditModeBar";
import { flushAll, hasUnsavedChanges } from "./utils/useAutoSave";

function App() {
  const [isAuth, setIsAuth] = useState(false)
  // 管理者が公開画面と同じ表示で確認するとき true
  const [isPreview, setIsPreview] = useState(false)
  const isEditing = isAuth && !isPreview
  // About Me の内容（ヒーローとフッターでも使う）。About Me を読み込むまでは undefined
  const [profile, setProfile] = useState()
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    async function checkAuth() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/auth/check`, {
          method: 'POST',
          headers: {
            'Authorization': token
          }
        });
        if (response.ok) {
          setIsAuth(true)
        } else if (response.status === 401) {
          // 期限切れなどで使えないトークンは消しておく
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    }
    checkAuth();
  }, [])

  const logout = async () => {
    // 未保存の分を保存してからトークンを消す
    await flushAll()
    if (hasUnsavedChanges() && !window.confirm('保存できていない変更があります。ログアウトすると失われますが、よろしいですか？')) return
    localStorage.removeItem('token')
    setIsAuth(false)
    setIsPreview(false)
  }

  return (
    <div className={isAuth ? 'pb-24' : ''}>
      <Header />
      <Routes>
        <Route path="/" element={<Home isAuth={isEditing} profile={profile} onProfileChange={setProfile} />} />
        <Route path="/auth" element={<Auth isAuth={isAuth} setIsAuth={setIsAuth} onLogout={logout} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer profile={profile} />
      {isAuth && <EditModeBar isPreview={isPreview} setIsPreview={setIsPreview} onLogout={logout} />}
    </div>
  );
}

export default App;
