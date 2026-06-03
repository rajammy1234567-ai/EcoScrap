import React, { useCallback, useState, useEffect } from "react";

let currentPath = "/dashboard";
let listeners = [];

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function useNavigation() {
  return useCallback((path) => {
    currentPath = path;
    notifyListeners();
  }, []);
}

export function useLocation() {
  const [, setUpdate] = useState();

  useEffect(() => {
    return subscribe(() => setUpdate({}));
  }, []);

  return currentPath;
}

export function getCurrentPath() {
  return currentPath;
}
