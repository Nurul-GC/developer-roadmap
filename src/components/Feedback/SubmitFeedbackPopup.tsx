import { useEffect, useRef, useState } from 'preact/hooks';
import { useToast } from '../../hooks/use-toast';
import { useTeamId } from '../../hooks/use-team-id';
import { useOutsideClick } from '../../hooks/use-outside-click';
import { useKeydown } from '../../hooks/use-keydown';
import { httpPost } from '../../lib/http';
import { CheckIcon } from '../ReactIcons/CheckIcon';

type SubmitFeedbackPopupProps = {
  onClose: () => void;
};

export function SubmitFeedbackPopup(props: SubmitFeedbackPopupProps) {
  const { onClose } = props;

  const toast = useToast();
  const popupBodyEl = useRef<HTMLDivElement>(null);
  const inputEl = useRef<HTMLTextAreaElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { teamId } = useTeamId();

  useOutsideClick(popupBodyEl, () => {
    onClose();
  });

  useKeydown('Escape', () => {
    onClose();
  });

  useEffect(() => {
    inputEl.current?.focus();
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { response, error } = await httpPost<{ status: 'ok' }>(
      `${import.meta.env.PUBLIC_API_URL}/v1-submit-team-feedback/${teamId}`,
      {
        feedback: feedbackText,
      }
    );

    if (error || !response) {
      setIsLoading(false);
      setError(error?.message || 'Something went wrong');
      return;
    }

    toast.success('Team feedback submitted successfully');
    setIsSuccess(true);
  };

  const handleClosePopup = () => {
    setIsLoading(false);
    setError('');
    setFeedbackText('');

    onClose();
  };

  return (
    <div class="fixed left-0 right-0 top-0 z-50 flex h-full items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50">
      <div class="relative h-full w-full max-w-md p-4 md:h-auto">
        <div
          ref={popupBodyEl}
          class="popup-body relative rounded-lg bg-white p-4 shadow"
        >
          {!isSuccess && (
            <>
              <h2 class="text-2xl font-semibold text-black">
                Enter your feedback
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="my-4">
                  <textarea
                    ref={inputEl}
                    name="submit-feedback"
                    id="submit-feedback"
                    className="mt-2 block min-h-[150px] w-full rounded-md border border-gray-300 px-3 py-2 outline-none placeholder:text-gray-400 focus:border-gray-400"
                    placeholder="Enter your feedback"
                    required
                    autoFocus
                    value={feedbackText}
                    onInput={(e) =>
                      setFeedbackText((e.target as HTMLInputElement).value)
                    }
                  />
                  {error && (
                    <p className="mt-2 rounded-lg bg-red-100 p-2 text-red-700">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleClosePopup}
                    className="flex-grow cursor-pointer rounded-lg bg-gray-200 py-2 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="flex-grow cursor-pointer rounded-lg bg-black py-2 text-white disabled:opacity-40"
                  >
                    {isLoading ? 'Please wait ..' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          )}

          {isSuccess && (
            <div className="flex w-full flex-col items-center">
              <CheckIcon additionalClasses="w-16 h-16 text-green-500" />
              <h1 className="mt-4 text-xl font-semibold text-black sm:text-2xl">
                Feedback Submitted
              </h1>
              <p className="text-center text-sm text-gray-500 sm:text-base">
                Thank you for submitting your feedback.
              </p>
              <button
                type="button"
                onClick={handleClosePopup}
                className="mt-8 w-full flex-grow cursor-pointer rounded-lg bg-black py-2 text-center text-white disabled:opacity-40"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
