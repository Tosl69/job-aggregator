import { logout } from '../services/api';

export default function Navbar({ user, setUser, setShowModal, setPage }) {
  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <h1 className="text-white text-xl font-bold tracking-tight">Crypto Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">{user.name}</span>
        {user.role === 'admin' && setPage && (
          <button
            onClick={() => setPage('admin')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Admin
          </button>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Widget
        </button>
        <button
          onClick={handleLogout}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Deconnexion
        </button>
      </div>
    </nav>
  );
}