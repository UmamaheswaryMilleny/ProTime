import { useState, useRef, useEffect } from "react";
import { useUserProfileQuery } from "../hooks/user/useUserProfile";
import { useUpdateUserProfile } from "../hooks/user/useUpdateUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "./User/Card";
import { Button } from "./User/Button";
import { Input } from "./User/input";
import { Label } from "./User/label";
import { Loader2, User, Edit2, X, Upload, Save, Lock } from "lucide-react";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import toast from "react-hot-toast";
import { userProfileSchema } from "../validations/userProfileSchema";
import type { UserProfileFormData } from "../validations/userProfileSchema";
import { ZodError } from "zod";

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
  const { data: profile, isLoading, error, refetch } = useUserProfileQuery();
  const updateProfile = useUpdateUserProfile();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState<UserProfileFormData>({
    firstName: "",
    lastName: "",
    bio: "",
    profileImage: undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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
  }, [profile]);

  /* ---------------- Cleanup Blob Preview ---------------- */
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
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setIsUploadingImage(true);

      const res = await fetch(`${API_URL}/api/v1/user/upload/profile-image`, {
        method: "POST",
        body: uploadData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");

      const data: UploadResponse = await res.json();

      setFormData((prev) => ({
        ...prev,
        profileImage: data.imageUrl,
      }));

      toast.success("Image uploaded. Click Save.");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");

      setImagePreview(
        profile?.profileImage ? `${API_URL}${profile.profileImage}` : null
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
        toast.success("Profile updated");
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
      profile.profileImage ? `${API_URL}${profile.profileImage}` : null
    );
    setIsEditMode(false);
  };

  /* ---------------- Reset Password ---------------- */
  const handleResetPassword = () => {
    if (!profile?.email) return toast.error("Email not found");
    setShowResetPasswordModal(true);
  };

  /* ---------------- Loading ---------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error || !profile) return <p className="text-red-500">Failed to load profile</p>;

  /* ---------------- Final Profile Image ---------------- */
  const finalProfileImage =
    profile.profileImage?.startsWith("http")
      ? profile.profileImage
      : profile.profileImage
      ? `${API_URL}${profile.profileImage}`
      : "/default-avatar.png";

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>My Profile</CardTitle>

            {!isEditMode && (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditMode(true)} variant="outline">
                  <Edit2 className="w-4 h-4" /> Edit
                </Button>
                <Button onClick={handleResetPassword} variant="outline">
                  <Lock className="w-4 h-4" /> Reset Password
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {isEditMode ? (
              <div className="space-y-6">

                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-3">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-32 h-32 rounded-full object-cover" />
                  ) : (
                    <User className="w-16 h-16" />
                  )}

                  <input ref={fileInputRef} type="file" hidden onChange={handleImageSelect} />

                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
                    <Upload className="w-4 h-4" /> Upload
                  </Button>
                </div>

                {/* Inputs */}
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  {validationErrors.firstName && <p className="text-red-500 text-sm">{validationErrors.firstName}</p>}
                </div>

                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                  {validationErrors.lastName && <p className="text-red-500 text-sm">{validationErrors.lastName}</p>}
                </div>

                <div>
                  <Label>Bio</Label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="border p-2 w-full rounded"
                  />
                  {validationErrors.bio && <p className="text-red-500 text-sm">{validationErrors.bio}</p>}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4" /> Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={finalProfileImage} className="w-32 h-32 rounded-full object-cover" />
                <p className="text-xl font-semibold">{profile.firstName} {profile.lastName}</p>
                <p className="text-gray-600">{profile.email}</p>
                <p>{profile.bio || "No bio yet"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showResetPasswordModal && (
        <ForgotPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          role="client"
        />
      )}
    </div>
  );
}
