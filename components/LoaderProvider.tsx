"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type LoaderContextValue = {
  isLoaderVisible: boolean;
  hideLoader: () => void;
  // ScrollVideo writes the load progress straight into this element, so the counter doesn't re-render.
  counterRef: RefObject<HTMLSpanElement | null>;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

type LoaderProviderProps = {
  children: ReactNode;
};

export function LoaderProvider({ children }: LoaderProviderProps) {
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hideLoader = useCallback(() => setIsLoaderVisible(false), []);
  const value = useMemo(
    () => ({ isLoaderVisible, hideLoader, counterRef }),
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
