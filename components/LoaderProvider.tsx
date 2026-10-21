"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LoaderContextValue = {
  isLoaderVisible: boolean;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

type LoaderProviderProps = {
  children: ReactNode;
};

export function LoaderProvider({ children }: LoaderProviderProps) {
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const hideLoader = useCallback(() => setIsLoaderVisible(false), []);
  const value = useMemo(
    () => ({ isLoaderVisible, hideLoader }),
    [isLoaderVisible, hideLoader],
  );

  return <LoaderContext value={value}>{children}</LoaderContext>;
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within LoaderProvider");
  }
  return context;
}
