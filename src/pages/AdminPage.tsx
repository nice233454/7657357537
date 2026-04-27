import { useState, useEffect } from 'react';
import { Upload, LogOut, Check, AlertCircle, Film, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLoggedIn(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loggedIn) fetchCurrentVideo();
  }, [loggedIn]);

  async function fetchCurrentVideo() {
    const { data } = await supabase
      .from('site_settings')
      .select('hero_video_url')
      .eq('id', 1)
      .maybeSingle();
    if (data?.hero_video_url) setCurrentVideoUrl(data.hero_video_url);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setLoggedIn(false);
    setEmail('');
    setPassword('');
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadError('');
    setUploadProgress(0);

    const ext = file.name.split('.').pop();
    const filePath = `hero-video-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      setUploadError('Ошибка загрузки: ' + uploadError.message);
      setUploading(false);
      return;
    }

    setUploadProgress(70);

    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ hero_video_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (updateError) {
      setUploadError('Ошибка сохранения: ' + updateError.message);
      setUploading(false);
      return;
    }

    setUploadProgress(100);
    setCurrentVideoUrl(publicUrl);
    setUploadSuccess(true);
    setUploading(false);
  }

  async function handleDeleteVideo() {
    if (!currentVideoUrl) return;
    if (!confirm('Удалить видео с главной страницы?')) return;

    const url = new URL(currentVideoUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('videos') + 1).join('/');

    await supabase.storage.from('videos').remove([filePath]);

    await supabase
      .from('site_settings')
      .update({ hero_video_url: '', updated_at: new Date().toISOString() })
      .eq('id', 1);

    setCurrentVideoUrl('');
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Film className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Панель администратора</h1>
            <p className="text-gray-400 mt-2">Войдите для управления контентом сайта</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {authLoading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-white font-bold text-lg">Управление видео</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Upload area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-white font-semibold text-lg mb-2">Видео на главной странице</h2>
          <p className="text-gray-400 text-sm mb-6">
            Загрузите видео, которое будет автоматически воспроизводиться на главной странице сайта.
            Рекомендуемый формат: MP4, до 50 МБ.
          </p>

          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm mb-4">
              <Check className="w-4 h-4 shrink-0" />
              Видео успешно загружено и установлено на главную страницу!
            </div>
          )}

          {uploading && (
            <div className="mb-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">Загрузка... {uploadProgress}%</p>
            </div>
          )}

          <label className="group flex flex-col items-center justify-center border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-xl p-8 sm:p-12 cursor-pointer transition-colors">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Upload className="w-7 h-7 text-emerald-400" />
            </div>
            <span className="text-white font-medium mb-1">Нажмите для загрузки видео</span>
            <span className="text-gray-500 text-sm">MP4, WebM — до 50 МБ</span>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Current video preview */}
        {currentVideoUrl && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Текущее видео</h2>
              <button
                onClick={handleDeleteVideo}
                className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black">
              <video
                src={currentVideoUrl}
                controls
                className="w-full max-h-80 object-contain"
              >
                <source src={currentVideoUrl} type="video/mp4" />
              </video>
            </div>
            <p className="text-gray-500 text-xs mt-3 break-all">{currentVideoUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
