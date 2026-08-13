import React from 'react';
import NavbarComponent from '@/Components/Navbar';
const UserLayout = ({ children }) => {
  return (
    <>
  <NavbarComponent></NavbarComponent>
      <div>{children}</div>
    </>
  )
}

export default UserLayout;