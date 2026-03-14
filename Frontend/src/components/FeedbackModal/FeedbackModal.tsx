import React, { useState } from "react";
import { X, Send } from "lucide-react";
import "./feedbackmodal.css";

interface FeedbackModalProps {
  onClose: () => void;
  userEmail: string;
  userName: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  onClose,
  userEmail,
  userName,
}) => {
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // send feedback via mailto (opens email client)
      const recipients = [
        "d00253215@student.dkit.ie",
        "d00262135@student.dkit.ie",
        "D00262370@student.dkit.ie",
        "D00252640@student.dkit.ie",
        "D00251825@student.dkit.ie",
      ].join(",");

      const subject = encodeURIComponent(
        `Stockd Feedback: ${formData.subject}`,
      );
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nFeedback:\n${formData.message}`,
      );

      window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending feedback:", error);
      alert("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="feedback__overlay" onClick={onClose}>
        <div
          className="feedback__modal success"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="feedback__success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>We truly value your feedback and will review it carefully.</p>
          <p className="feedback__success-subtext">
            Your input helps us improve Stockd for everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback__overlay" onClick={onClose}>
      <div className="feedback__modal" onClick={(e) => e.stopPropagation()}>
        <button className="feedback__close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="feedback__title">Send Us Your Feedback</h2>
        <p className="feedback__subtitle">
          We'd love to hear your thoughts, suggestions, or concerns about
          Stockd.
        </p>

        <form onSubmit={handleSubmit} className="feedback__form">
          <div className="feedback__field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>

          <div className="feedback__field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="feedback__field">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a topic</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Feedback">General Feedback</option>
              <option value="User Experience">User Experience</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="feedback__field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Tell us what's on your mind..."
              rows={6}
            />
          </div>

          <button
            type="submit"
            className="feedback__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send size={18} />
                Send Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
