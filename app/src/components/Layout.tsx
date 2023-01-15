import React from 'react';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="kuku">
        <Outlet />
    </div>
  );
}

export default Layout;
