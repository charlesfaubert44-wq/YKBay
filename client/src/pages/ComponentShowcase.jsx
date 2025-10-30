import { useState } from 'react';
import { Heart, Star, Download, Send, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';

/**
 * Component Showcase Page
 * Demonstrates all the new UI components
 * Access at /showcase (add route in App.jsx)
 */
const ComponentShowcase = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-display font-bold text-ice-white mb-4 text-shadow-aurora">
          Component Showcase
        </h1>
        <p className="text-xl text-ice-blue">
          Interactive UI/UX Components for YK Bay
        </p>
        <div className="aurora-divider mx-auto mt-6 w-64" />
      </div>

      {/* Buttons Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Buttons
        </h2>
        <Card variant="glass" padding="lg">
          <div className="space-y-6">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold text-ice-blue mb-4">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="aurora">Aurora</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-ice-blue mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-lg font-semibold text-ice-blue mb-4">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button leftIcon={<Heart size={18} />}>With Left Icon</Button>
                <Button rightIcon={<Star size={18} />}>With Right Icon</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Cards Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default">
            <h3 className="text-xl font-bold text-ice-white mb-2">Default Card</h3>
            <p className="text-ice-blue">Midnight blue with subtle backdrop blur</p>
          </Card>

          <Card variant="glass">
            <h3 className="text-xl font-bold text-ice-white mb-2">Glass Card</h3>
            <p className="text-ice-blue">Frosted glass aesthetic</p>
          </Card>

          <Card variant="aurora">
            <h3 className="text-xl font-bold text-ice-white mb-2">Aurora Card</h3>
            <p className="text-ice-blue">Northern lights gradient background</p>
          </Card>

          <Card variant="solid">
            <h3 className="text-xl font-bold text-ice-white mb-2">Solid Card</h3>
            <p className="text-ice-blue">Solid dark background</p>
          </Card>

          <Card variant="elevated">
            <h3 className="text-xl font-bold text-ice-white mb-2">Elevated Card</h3>
            <p className="text-ice-blue">Enhanced shadow and blur</p>
          </Card>

          <Card variant="glass" hover>
            <h3 className="text-xl font-bold text-ice-white mb-2">Hover Card</h3>
            <p className="text-ice-blue">Try hovering over me!</p>
          </Card>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Inputs
        </h2>
        <Card variant="glass" padding="lg">
          <div className="space-y-6 max-w-2xl">
            <Input
              label="Basic Input"
              placeholder="Enter text here..."
              fullWidth
            />

            <Input
              label="With Left Icon"
              placeholder="Search..."
              leftIcon={<Star size={18} />}
              fullWidth
            />

            <Input
              label="With Helper Text"
              placeholder="your@email.com"
              helperText="We'll never share your email with anyone"
              fullWidth
            />

            <Input
              label="With Error"
              placeholder="Enter value..."
              error="This field is required"
              fullWidth
            />

            <Input
              label="Password Input"
              type="password"
              placeholder="Enter password..."
              leftIcon={<AlertCircle size={18} />}
              helperText="Must be at least 8 characters"
              fullWidth
            />
          </div>
        </Card>
      </section>

      {/* Toast Notifications Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Toast Notifications
        </h2>
        <Card variant="glass" padding="lg">
          <p className="text-ice-blue mb-6">
            Click the buttons below to see toast notifications in action:
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => showSuccess('Success! Your action was completed.')}
            >
              Show Success
            </Button>
            <Button
              variant="danger"
              onClick={() => showError('Error! Something went wrong.')}
            >
              Show Error
            </Button>
            <Button
              variant="secondary"
              onClick={() => showWarning('Warning! Please check your input.')}
            >
              Show Warning
            </Button>
            <Button
              variant="outline"
              onClick={() => showInfo('Info: This is an informational message.')}
            >
              Show Info
            </Button>
          </div>
        </Card>
      </section>

      {/* Modal Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Modal
        </h2>
        <Card variant="glass" padding="lg">
          <p className="text-ice-blue mb-6">
            Click the button to open a modal dialog:
          </p>
          <Button variant="aurora" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            size="md"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    showSuccess('Saved successfully!');
                    setModalOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-ice-white">
                This is an example modal dialog with a title, content area, and footer with action buttons.
              </p>
              <p className="text-ice-blue">
                You can close it by clicking the X button, clicking outside the modal,
                or pressing the ESC key.
              </p>
              <Input
                label="Example Input"
                placeholder="Try typing something..."
                fullWidth
              />
            </div>
          </Modal>
        </Card>
      </section>

      {/* Loading States Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Loading States
        </h2>

        <div className="space-y-6">
          <Card variant="glass" padding="lg">
            <h3 className="text-xl font-semibold text-ice-white mb-4">Loading Spinners</h3>
            <div className="flex flex-wrap items-center gap-8">
              <div className="text-center">
                <LoadingSpinner size="sm" />
                <p className="text-ice-blue text-sm mt-2">Small</p>
              </div>
              <div className="text-center">
                <LoadingSpinner size="md" />
                <p className="text-ice-blue text-sm mt-2">Medium</p>
              </div>
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-ice-blue text-sm mt-2">Large</p>
              </div>
              <div className="text-center">
                <LoadingSpinner size="xl" />
                <p className="text-ice-blue text-sm mt-2">Extra Large</p>
              </div>
              <div>
                <LoadingSpinner size="md" text="Loading data..." />
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <h3 className="text-xl font-semibold text-ice-white mb-4">Skeleton Screens</h3>
            <div className="space-y-6">
              <div>
                <p className="text-ice-blue text-sm mb-3">Skeleton Card</p>
                <SkeletonCard />
              </div>
              <div>
                <p className="text-ice-blue text-sm mb-3">Skeleton List</p>
                <SkeletonList count={3} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Colors & Typography Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Colors & Typography
        </h2>

        <Card variant="glass" padding="lg">
          <div className="space-y-8">
            {/* Color Palette */}
            <div>
              <h3 className="text-xl font-semibold text-ice-white mb-4">Color Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="h-20 bg-aurora-green rounded-lg mb-2"></div>
                  <p className="text-sm text-ice-blue">Aurora Green</p>
                </div>
                <div className="text-center">
                  <div className="h-20 bg-aurora-purple rounded-lg mb-2"></div>
                  <p className="text-sm text-ice-blue">Aurora Purple</p>
                </div>
                <div className="text-center">
                  <div className="h-20 bg-aurora-blue rounded-lg mb-2"></div>
                  <p className="text-sm text-ice-blue">Aurora Blue</p>
                </div>
                <div className="text-center">
                  <div className="h-20 bg-ice-blue rounded-lg mb-2"></div>
                  <p className="text-sm text-midnight-dark">Ice Blue</p>
                </div>
                <div className="text-center">
                  <div className="h-20 bg-midnight-blue rounded-lg border border-ice-blue/20 mb-2"></div>
                  <p className="text-sm text-ice-blue">Midnight Blue</p>
                </div>
                <div className="text-center">
                  <div className="h-20 bg-tundra-gold rounded-lg mb-2"></div>
                  <p className="text-sm text-midnight-dark">Tundra Gold</p>
                </div>
                <div className="text-center">
                  <div className="h-20 bg-safety-red rounded-lg mb-2"></div>
                  <p className="text-sm text-ice-white">Safety Red</p>
                </div>
                <div className="text-center">
                  <div className="h-20 bg-forest-green rounded-lg mb-2"></div>
                  <p className="text-sm text-ice-white">Forest Green</p>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-xl font-semibold text-ice-white mb-4">Typography</h3>
              <div className="space-y-4">
                <p className="text-4xl font-display font-bold text-ice-white">
                  Heading 1 - Display Font
                </p>
                <p className="text-3xl font-display font-bold text-ice-white">
                  Heading 2 - Display Font
                </p>
                <p className="text-2xl font-display font-bold text-ice-white">
                  Heading 3 - Display Font
                </p>
                <p className="text-xl text-ice-white">
                  Body Large - Sans Font
                </p>
                <p className="text-base text-ice-blue">
                  Body Regular - Sans Font (Ice Blue)
                </p>
                <p className="text-sm text-ice-blue/70">
                  Body Small - Sans Font (Muted)
                </p>
              </div>
            </div>

            {/* Gradients */}
            <div>
              <h3 className="text-xl font-semibold text-ice-white mb-4">Gradients</h3>
              <div className="space-y-3">
                <div className="h-16 bg-aurora-gradient rounded-lg flex items-center justify-center">
                  <p className="text-ice-white font-semibold">Aurora Gradient</p>
                </div>
                <div className="h-16 bg-gradient-to-r from-midnight-blue to-midnight-dark rounded-lg flex items-center justify-center border border-ice-blue/20">
                  <p className="text-ice-white font-semibold">Midnight Gradient</p>
                </div>
                <div className="h-16 bg-gradient-to-br from-ice-blue to-ice-white rounded-lg flex items-center justify-center">
                  <p className="text-midnight-dark font-semibold">Ice Gradient</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Animations Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold text-ice-white mb-6">
          Animations
        </h2>
        <Card variant="glass" padding="lg">
          <div className="space-y-6">
            <div className="p-6 bg-midnight-dark rounded-lg animate-fadeIn">
              <p className="text-ice-white font-semibold">Fade In Animation</p>
              <p className="text-ice-blue text-sm">className="animate-fadeIn"</p>
            </div>

            <div className="p-6 bg-midnight-dark rounded-lg animate-slideUp">
              <p className="text-ice-white font-semibold">Slide Up Animation</p>
              <p className="text-ice-blue text-sm">className="animate-slideUp"</p>
            </div>

            <div className="p-6 bg-midnight-dark rounded-lg animate-slideInRight">
              <p className="text-ice-white font-semibold">Slide In Right Animation</p>
              <p className="text-ice-blue text-sm">className="animate-slideInRight"</p>
            </div>

            <div className="p-6 bg-gradient-to-r from-aurora-green via-aurora-purple to-aurora-blue rounded-lg animate-gradient">
              <p className="text-ice-white font-semibold">Animated Gradient</p>
              <p className="text-ice-white text-sm">className="animate-gradient"</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <section className="text-center">
        <div className="aurora-divider mx-auto w-64 mb-6" />
        <p className="text-ice-blue text-lg mb-4">
          All components are fully responsive and accessible
        </p>
        <Button
          variant="aurora"
          size="lg"
          leftIcon={<Download size={20} />}
          onClick={() => showInfo('Check UI_UX_REDESIGN_SUMMARY.md for documentation')}
        >
          View Full Documentation
        </Button>
      </section>
    </div>
  );
};

export default ComponentShowcase;
