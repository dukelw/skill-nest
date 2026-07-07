"use client";

import { Spinner } from "~/components/ui/primitives";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Spinner color="success" size="xl" aria-label="Green loading spinner" />
    </div>
  );
};

export default Loader;
