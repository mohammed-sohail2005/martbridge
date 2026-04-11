import React, { createContext, useContext, useState } from 'react';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    show: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' or 'confirm'
    resolve: null,
  });

  const showAlert = (message, title = 'Notification') => {
    return new Promise((resolve) => {
      setPopup({
        show: true,
        title,
        message,
        type: 'alert',
        resolve,
      });
    });
  };

  const showConfirm = (message, title = 'Confirm Action') => {
    return new Promise((resolve) => {
      setPopup({
        show: true,
        title,
        message,
        type: 'confirm',
        resolve,
      });
    });
  };

  const closePopup = (value) => {
    if (popup.resolve) popup.resolve(value);
    setPopup({ ...popup, show: false });
  };

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm, popup, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
};
