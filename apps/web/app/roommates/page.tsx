"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";

interface RoommateProfile {
  id: string;
  user_id: string;
  display_name: string;
  school?: string;
  program?: string;
  graduation_year?: string;
  bio?: string;
  budget_min?: number;
  budget_max?: number;
  move_in_date?: string;
  preferred_locations?: string[];
  room_type?: string;
  sleep_schedule?: string;
  noise_tolerance?: string;
  cleanliness_level?: string;
  guests_preference?: string;
  pets_preference?: string;
  discoverable?: boolean;
  compatibility_tags?: string[];
}

export default function RoommateMatchingPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<RoommateProfile | null>(null);
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [filters, setFilters] = useState({
    budget_min: "",
    budget_max: "",
    location: "",
    room_type: "",
  });
  const [form, setForm] = useState({
    display_name: "",
    school: "",
    program: "",
    graduation_year: "",
    bio: "",
    budget_min: "",
    budget_max: "",
    move_in_date: "",
    preferred_locations: "",
    room_type: "private",
    sleep_schedule: "flexible",
    noise_tolerance: "moderate",
    cleanliness_level: "average",
    guests_preference: "occasional",
    pets_preference: "ok",
    discoverable: true,
    contact_email: "",
    contact_phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const buildUserHeaders = () => {
    const headers: HeadersInit = {};
    if (session?.user?.id) {
      headers["x-user-id"] = session.user.id;
      if (session.user.email) headers["x-user-email"] = session.user.email;
      if (session.user.name) headers["x-user-name"] = session.user.name;
    }
    return headers;
  };

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const response = await apiClient.get<{ status: string; data: RoommateProfile | null }>(
      "/api/roommates/profile",
      { headers: buildUserHeaders() }
    );
    if (response.status === "success") {
      setProfile(response.data || null);
      if (response.data) {
        setForm({
          display_name: response.data.display_name || "",
          school: response.data.school || "",
          program: response.data.program || "",
          graduation_year: response.data.graduation_year || "",
          bio: response.data.bio || "",
          budget_min: response.data.budget_min ? String(response.data.budget_min) : "",
          budget_max: response.data.budget_max ? String(response.data.budget_max) : "",
          move_in_date: response.data.move_in_date || "",
          preferred_locations: response.data.preferred_locations?.join(", ") || "",
          room_type: response.data.room_type || "private",
          sleep_schedule: response.data.sleep_schedule || "flexible",
          noise_tolerance: response.data.noise_tolerance || "moderate",
          cleanliness_level: response.data.cleanliness_level || "average",
          guests_preference: response.data.guests_preference || "occasional",
          pets_preference: response.data.pets_preference || "ok",
          discoverable: response.data.discoverable ?? true,
          contact_email: response.data.contact_email || "",
          contact_phone: response.data.contact_phone || "",
        });
      }
    }
  };

  const fetchProfiles = async () => {
    if (!session?.user?.id) return;
    const params = new URLSearchParams();
    if (filters.budget_min) params.set("budget_min", filters.budget_min);
    if (filters.budget_max) params.set("budget_max", filters.budget_max);
    if (filters.location) params.set("location", filters.location);
    if (filters.room_type) params.set("room_type", filters.room_type);
    const endpoint = `/api/roommates/browse${params.toString() ? `?${params}` : ""}`;
    const response = await apiClient.get<{ status: string; data: RoommateProfile[] }>(endpoint, {
      headers: buildUserHeaders(),
    });
    if (response.status === "success") {
      setProfiles(response.data || []);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSave = async () => {
    if (!form.display_name.trim()) {
      setError("Display name is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    const payload = {
      display_name: form.display_name.trim(),
      school: form.school || null,
      program: form.program || null,
      graduation_year: form.graduation_year || null,
      bio: form.bio || null,
      budget_min: form.budget_min ? parseInt(form.budget_min) : null,
      budget_max: form.budget_max ? parseInt(form.budget_max) : null,
      move_in_date: form.move_in_date || null,
      preferred_locations: form.preferred_locations
        ? form.preferred_locations.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
      room_type: form.room_type,
      sleep_schedule: form.sleep_schedule,
      noise_tolerance: form.noise_tolerance,
      cleanliness_level: form.cleanliness_level,
      guests_preference: form.guests_preference,
      pets_preference: form.pets_preference,
      discoverable: form.discoverable,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
    };

    try {
      const response = await apiClient.put<{ status: string; data: RoommateProfile }>(
        "/api/roommates/profile",
        payload,
        { headers: buildUserHeaders() }
      );
      if (response.status === "success") {
        setProfile(response.data);
        fetchProfiles();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnect = async (targetUserId: string) => {
    try {
      await apiClient.post(
        "/api/roommates/requests",
        { target_user_id: targetUserId, message: "Hi! Interested in connecting about housing." },
        { headers: buildUserHeaders() }
      );
      alert("Request sent");
    } catch (err: any) {
      setError(err.message || "Failed to send request");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Roommate Matching</h1>
          <p className="text-muted-foreground text-lg">
            Create your profile and browse compatible roommates.
          </p>
        </div>

        {!session?.user?.id && (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              Sign in to create your roommate profile and browse matches.
            </CardContent>
          </Card>
        )}

        {session?.user?.id && (
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Public profiles are visible to all logged-in users. You can switch to opt-in by
                turning off Discoverable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Display name"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                />
                <Input
                  placeholder="School"
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                />
                <Input
                  placeholder="Program"
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                />
                <Input
                  placeholder="Graduation year"
                  value={form.graduation_year}
                  onChange={(e) => setForm({ ...form, graduation_year: e.target.value })}
                />
                <Input
                  placeholder="Budget min"
                  value={form.budget_min}
                  onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                />
                <Input
                  placeholder="Budget max"
                  value={form.budget_max}
                  onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                />
                <Input
                  placeholder="Move-in date"
                  type="date"
                  value={form.move_in_date}
                  onChange={(e) => setForm({ ...form, move_in_date: e.target.value })}
                />
                <Input
                  placeholder="Preferred locations (comma separated)"
                  value={form.preferred_locations}
                  onChange={(e) => setForm({ ...form, preferred_locations: e.target.value })}
                />
                <Input
                  placeholder="Contact email (optional)"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
                <Input
                  placeholder="Contact phone (optional)"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Room type (private/shared)"
                  value={form.room_type}
                  onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                />
                <Input
                  placeholder="Sleep schedule"
                  value={form.sleep_schedule}
                  onChange={(e) => setForm({ ...form, sleep_schedule: e.target.value })}
                />
                <Input
                  placeholder="Noise tolerance"
                  value={form.noise_tolerance}
                  onChange={(e) => setForm({ ...form, noise_tolerance: e.target.value })}
                />
                <Input
                  placeholder="Cleanliness"
                  value={form.cleanliness_level}
                  onChange={(e) => setForm({ ...form, cleanliness_level: e.target.value })}
                />
                <Input
                  placeholder="Guests preference"
                  value={form.guests_preference}
                  onChange={(e) => setForm({ ...form, guests_preference: e.target.value })}
                />
                <Input
                  placeholder="Pets preference"
                  value={form.pets_preference}
                  onChange={(e) => setForm({ ...form, pets_preference: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.discoverable}
                    onChange={(e) => setForm({ ...form, discoverable: e.target.checked })}
                  />
                  Discoverable (opt-in visibility)
                </label>
              </div>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Short bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <Button onClick={handleSave} disabled={isSaving}>
                {profile ? "Update Profile" : "Create Profile"}
              </Button>
            </CardContent>
          </Card>
        )}

        {session?.user?.id && (
          <Card>
            <CardHeader>
              <CardTitle>Browse Roommates</CardTitle>
              <CardDescription>Filter by budget, location, and room type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Input
                  placeholder="Budget min"
                  value={filters.budget_min}
                  onChange={(e) => setFilters({ ...filters, budget_min: e.target.value })}
                />
                <Input
                  placeholder="Budget max"
                  value={filters.budget_max}
                  onChange={(e) => setFilters({ ...filters, budget_max: e.target.value })}
                />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
                <Input
                  placeholder="Room type"
                  value={filters.room_type}
                  onChange={(e) => setFilters({ ...filters, room_type: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {profiles.map((p) => (
                  <Card key={p.id}>
                    <CardHeader>
                      <CardTitle>{p.display_name}</CardTitle>
                      <CardDescription>
                        {p.school || "School"} · {p.program || "Program"} · {p.graduation_year || "Year"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {p.room_type && <Badge variant="secondary">{p.room_type}</Badge>}
                        {p.sleep_schedule && <Badge variant="secondary">{p.sleep_schedule}</Badge>}
                        {p.noise_tolerance && <Badge variant="secondary">{p.noise_tolerance}</Badge>}
                        {p.cleanliness_level && <Badge variant="secondary">{p.cleanliness_level}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{p.bio}</p>
                      <div className="text-sm">
                        Budget: {p.budget_min || "-"} - {p.budget_max || "-"}
                      </div>
                      <div className="text-sm">
                        Locations: {p.preferred_locations?.join(", ") || "Any"}
                      </div>
                      <Button onClick={() => handleConnect(p.user_id)}>
                        Request to Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {profiles.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No matches yet. Try broadening your filters.
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}



