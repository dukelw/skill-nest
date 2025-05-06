/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { authService } from "~/services/authService";
// import { useRouter } from "next/navigation";

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>No profile found. Please log in.</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile.name}</h1>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone || "No phone number available"}</p>
    </div>
  );
}
