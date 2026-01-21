import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface ShareEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMessage: string;
    shareUrl?: string; // Optional if only generating link
}

export const ShareEmailModal = ({
    isOpen,
    onClose,
    defaultMessage,
    shareUrl,
}: ShareEmailModalProps) => {
    const [emails, setEmails] = useState("");
    const [message, setMessage] = useState(defaultMessage);
    const [loading, setLoading] = useState(false);

    const validateEmails = (input: string) => {
        const emailList = input.split(",").map((e) => e.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (const email of emailList) {
            if (!email || !emailRegex.test(email)) {
                return false;
            }
        }
        return true;
    };

    const handleSend = async () => {
        if (!emails.trim()) {
            toast.error("Please enter at least one email address");
            return;
        }

        if (!validateEmails(emails)) {
            toast.error("Please enter valid email addresses separated by commas");
            return;
        }

        setLoading(true);
        try {
            // If shareUrl is not provided, we might need to generate it
            // But for this component, we expect the caller to provide the core content or link
            // For wishlist, the link is generated. For product, it's the current URL.

            const payload = {
                emails: emails.split(",").map((e) => e.trim()),
                message,
                url: shareUrl || window.location.href, // Fallback to current URL
            };

            const response = await apiService.shareViaEmail(payload);

            if (response.success) {
                toast.success("Email sent successfully!");
                onClose();
                setEmails("");
                setMessage(defaultMessage);
            } else {
                toast.error(response.error || "Failed to send email");
            }
        } catch (error) {
            console.error("Email share error:", error);
            toast.error("An error occurred while sending the email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white text-black p-6 rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center mb-4">
                        Share via Email
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            To (separate multiple emails with commas)
                        </label>
                        <Input
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            placeholder="friend@example.com, family@example.com"
                            className="w-full border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Message
                        </label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            className="bg-teal-600 text-white hover:bg-teal-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" />
                            ) : (
                                "Send"
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-2">
                        Protected by reCAPTCHA and subject to rate limiting.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
