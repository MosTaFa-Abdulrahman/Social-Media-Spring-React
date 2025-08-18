import "./share.scss";
import { useContext, useState } from "react";
import { Image, Map, UserRound, X, Loader2, AlertCircle } from "lucide-react";
import { defaultUserImg } from "../../dummyData";
import upload from "../../upload";

// Context && React-Query
import { AuthContext } from "../../context/authContext";
import { useCreatePost } from "../../store/posts";
import toast from "react-hot-toast";

function Share() {
  // Context && React-Query
  const { currentUser } = useContext(AuthContext);
  const createPostMutation = useCreatePost();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // File handling state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
      ];

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          file: "Please select a valid image (JPEG, PNG, GIF) or video (MP4, MPEG, MOV) file",
        }));
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          file: "File size must be less than 10MB",
        }));
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);

      // Clear file error
      if (errors.file) {
        setErrors((prev) => ({
          ...prev,
          file: null,
        }));
      }
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    // Reset file input
    const fileInput = document.getElementById("file");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    // Description validation
    if (formData.description.length > 400) {
      newErrors.description = "Description cannot exceed 400 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = "";

      // Upload file if selected
      if (selectedFile) {
        imageUrl = await upload(selectedFile);
      }

      // Prepare post data
      const postData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl,
        userId: currentUser.id,
      };

      // Create post
      await createPostMutation.mutateAsync(postData);
      toast.success("Post Created 🤗🤩");

      // Reset form
      setFormData({ title: "", description: "" });
      removeFile();
      setShowErrors(false);
      setErrors({});
    } catch (error) {
      console.error("Error creating post:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to create post. Please try again.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isUploading || createPostMutation.isPending;

  return (
    <div className="share">
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="top">
            <img src={currentUser?.imgUrl || defaultUserImg} alt="" />
            <div className="inputs">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What's the title of your post?"
                maxLength={100}
                disabled={isLoading}
                className={showErrors && errors.title ? "error" : ""}
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={`What's on your mind ${
                  currentUser?.fullName || "User"
                }?`}
                maxLength={400}
                disabled={isLoading}
                className={showErrors && errors.description ? "error" : ""}
              />
            </div>
          </div>

          {/* Error Messages */}
          {showErrors && (
            <div className="errors">
              {errors.title && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{errors.title}</span>
                </div>
              )}
              {errors.description && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{errors.description}</span>
                </div>
              )}
              {errors.file && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{errors.file}</span>
                </div>
              )}
              {errors.submit && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{errors.submit}</span>
                </div>
              )}
            </div>
          )}

          {/* Character Counters */}
          <div className="counters">
            <span
              className={`counter ${
                formData.title.length > 100 ? "exceeded" : ""
              }`}
            >
              Title: {formData.title.length}/100
            </span>
            <span
              className={`counter ${
                formData.description.length > 400 ? "exceeded" : ""
              }`}
            >
              Description: {formData.description.length}/400
            </span>
          </div>

          {/* File Preview */}
          {filePreview && (
            <div className="file-preview">
              <button
                type="button"
                className="remove-file"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
              {selectedFile?.type.startsWith("image/") ? (
                <img src={filePreview} alt="Preview" />
              ) : (
                <video controls>
                  <source src={filePreview} type={selectedFile?.type} />
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="file-info">
                <span>{selectedFile?.name}</span>
                <span>
                  {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          <hr />

          <div className="bottom">
            <div className="left">
              <input
                type="file"
                id="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={isLoading}
                style={{ display: "none" }}
              />
              <label htmlFor="file" className={isLoading ? "disabled" : ""}>
                <div className="item">
                  <Image size={20} />
                  <span>Add Image/Video</span>
                </div>
              </label>

              <div className="item disabled">
                <Map size={20} />
                <span>Add Place</span>
              </div>

              <div className="item disabled">
                <UserRound size={20} />
                <span>Tag Friends</span>
              </div>
            </div>

            <div className="right">
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className={isLoading ? "loading" : ""}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    {isUploading ? "" : "Posting..."}
                  </>
                ) : (
                  "Share"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Share;
