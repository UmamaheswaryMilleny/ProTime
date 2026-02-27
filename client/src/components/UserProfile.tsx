import { useState, useRef, useEffect } from "react";
import Sidebar, { SidebarItem } from "./User/Sidebar";
import { useUserProfileQuery } from "../hooks/user/useUserProfile";
import { useUpdateUserProfile } from "../hooks/user/useUpdateUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "./User/Card";
import { Button } from "./User/Button";
import { Input } from "./User/input";
import { Label } from "./User/label";
import {
  Loader2,
  User,
  Edit2,
  X,
  Upload,
  Save,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";
import { userProfileSchema } from "../validations/userProfileSchema";
import type { UserProfileFormData } from "../validations/userProfileSchema";
import { ZodError } from "zod";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config/env";

/* ---------------- Types ---------------- */
type ValidationErrors = {
  firstName?: string;
  lastName?: string;
  bio?: string;
};

interface UploadResponse {
  imageUrl: string;
}

const API_URL = "http://localhost:3000";

/* ---------------- Component ---------------- */
export function UserProfile() {
  const navigate = useNavigate();
  const { data: profile, isLoading, error, refetch } = useUserProfileQuery();
  const updateProfile = useUpdateUserProfile();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [formData, setFormData] = useState<UserProfileFormData>({
    firstName: "",
    lastName: "",
    bio: "",
    profileImage: undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>({});

  /* ---------------- Load Profile ---------------- */
  useEffect(() => {
    if (!profile) return;

    setFormData({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      bio: profile.bio ?? "",
      profileImage: profile.profileImage ?? undefined,
    });

    setImagePreview(
      profile.profileImage
        ? profile.profileImage.startsWith("http")
          ? profile.profileImage
          : `${API_URL}${profile.profileImage}`
        : null
    );

    setImageError(false);
  }, [profile]);

  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* ---------------- Validate ---------------- */
  const validateForm = (data: UserProfileFormData): boolean => {
    try {
      userProfileSchema.parse(data);
      setValidationErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: ValidationErrors = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0] as keyof ValidationErrors;
          errors[field] = issue.message;
        });
        setValidationErrors(errors);
      }
      toast.error("Fix validation errors");
      return false;
    }
  };

  /* ---------------- Image Upload ---------------- */
  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only images allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB allowed");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setImageError(false);

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setIsUploadingImage(true);

      const res = await fetch(
        `${API_URL}/api/v1/user/upload/profile-image`,
        {
          method: "POST",
          body: uploadData,
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data: UploadResponse = await res.json();

      setFormData((prev) => ({
        ...prev,
        profileImage: data.imageUrl,
      }));

      toast.success("Image uploaded. Click Save.");
    } catch {
      toast.error("Upload failed");
      setImagePreview(
        profile?.profileImage
          ? `${API_URL}${profile.profileImage}`
          : null
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  /* ---------------- Save ---------------- */
  const handleSave = () => {
    if (!validateForm(formData)) return;

    updateProfile.mutate(formData, {
      onSuccess: async () => {
        // toast.success("Profile updated");
        setIsEditMode(false);
        await refetch();
      },
      onError: () => toast.error("Update failed"),
    });
  };

  /* ---------------- Cancel ---------------- */
  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      bio: profile.bio ?? "",
      profileImage: profile.profileImage ?? undefined,
    });

    setImagePreview(
      profile.profileImage
        ? `${API_URL}${profile.profileImage}`
        : null
    );
    setImageError(false);
    setIsEditMode(false);
  };

  /* ---------------- Loading ---------------- */
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-white" />
      </div>
    );
  }

  if (error || !profile)
    return <p className="text-red-500">Failed to load profile</p>;

  const finalProfileImage =
    profile.profileImage?.startsWith("http")
      ? profile.profileImage
      : profile.profileImage
      ? `${API_URL}${profile.profileImage}`
      : null;

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-screen bg-[#0F0F12]">
      {/* Sidebar */}
      <Sidebar>
        <SidebarItem
          icon={<LayoutDashboard />}
          text="Home"
          onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}
        />
        <SidebarItem icon={<User />} text="My Profile" active />
      </Sidebar>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <section className="bg-[#1C1C21] p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-white">
            My Profile
          </h2>
          <p className="text-sm text-gray-400">
            Manage your personal information
          </p>
        </section>

        {/* Card */}
        <Card className="max-w-3xl bg-[#1C1C21] border-border shadow-xl">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-white">
              Profile Details
            </CardTitle>

            {!isEditMode && (
              <Button
                variant="outline"
                onClick={() => setIsEditMode(true)}
              >
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            )}
          </CardHeader>

          <CardContent>
            {isEditMode ? (
              <div className="space-y-6">
                {/* Avatar (Edit Mode) */}
                <div className="flex flex-col items-center gap-3">
                  {imagePreview && !imageError ? (
                    <img
                      src={imagePreview}
                      onError={() => setImageError(true)}
                      className="w-32 h-32 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-[#2A2A2F] flex items-center justify-center border">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleImageSelect}
                  />

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    <Upload className="w-4 h-4 mr-1" /> Upload
                  </Button>
                </div>

                {/* Inputs */}
                <div>
                  <Label className="text-white">First Name</Label>
                  <Input
                    className="text-white"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName: e.target.value,
                      })
                    }
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-white">Last Name</Label>
                  <Input
                    className="text-white"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName: e.target.value,
                      })
                    }
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-white">Bio</Label>
                  <textarea
                    className="w-full rounded-md p-2 bg-black border border-gray-700 text-white"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bio: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                {/* Avatar (View Mode) */}
                {finalProfileImage && !imageError ? (
                  <img
                    src={finalProfileImage}
                    onError={() => setImageError(true)}
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#2A2A2F] flex items-center justify-center mx-auto">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <p className="text-xl font-semibold text-white">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-gray-400">{profile.email}</p>
                <p className="text-gray-300">
                  {profile.bio || "No bio added yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
