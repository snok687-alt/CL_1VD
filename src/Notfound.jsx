import React from 'react';
import { useNavigate } from 'react-router-dom';

function Notfound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      <h1>404</h1>
      <p>哎呀！页面未找到。</p>
      <button 
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        返回首页
      </button>
    </div>
  );
}

export default Notfound;
