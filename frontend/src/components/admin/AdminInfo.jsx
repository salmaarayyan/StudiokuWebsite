import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './AdminInfo.css';

const AdminInfo = () => {
  const { user } = useContext(AuthContext);
  const [loginTime, setLoginTime] = useState('');

  useEffect(() => {
    // Get login time from localStorage (set during login)
    const storedLoginTime = localStorage.getItem('adminLoginTime');
    if (storedLoginTime) {
      const date = new Date(storedLoginTime);
      setLoginTime(date.toLocaleString('id-ID'));
    } else {
      setLoginTime('Belum tercatat');
    }
  }, []);

  return (
    <div className="admin-info-panel">
      <div className="info-header">
        <h3 className="info-title">Info Admin</h3>
      </div>

      <div className="info-content">
        <div className="info-item">
          <label className="info-label">Email</label>
          <p className="info-value">{user?.email || '-'}</p>
        </div>

        <div className="info-item">
          <label className="info-label">Login Terakhir</label>
          <p className="info-value">{loginTime || 'Loading...'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminInfo;
