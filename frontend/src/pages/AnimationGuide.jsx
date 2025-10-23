import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Sparkles, Palette, Zap, Layers, Settings } from 'lucide-react';
import { AnimatedCard, AnimatedButton, AnimatedText } from '@/components/GlobalAnimations';

const AnimationGuide = () => {
  const codeExamples = {
    globalWrapper: `// Wrap your app with animation providers
<AnimationProvider>
  <LenisWrapper 
    enableClickSpark={true}
    enableBackground={true}
    backgroundType="gradient"
  >
    {children}
  </LenisWrapper>
</AnimationProvider>`,

    animatedComponents: `// Use animated components
import { AnimatedCard, AnimatedButton, AnimatedText } from '@/components/GlobalAnimations';

<AnimatedCard className="my-card">
  <AnimatedText 
    text="Hello World" 
    type="split" 
    className="text-2xl font-bold"
  />
  <AnimatedButton onClick={handleClick}>
    Click Me
  </AnimatedButton>
</AnimatedCard>`,

    backgroundUsage: `// Use animated background
import { AnimatedBackground } from '@/components/AnimatedBackground';

<AnimatedBackground 
  type="particles"
  primaryColor="hsl(var(--primary))"
  intensity={0.7}
/>`,

    customAnimations: `// Create custom animations with framer-motion
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
  Animated content
</motion.div>`
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedText 
            text="Animation Guide" 
            type="split" 
            className="text-4xl font-bold text-foreground mb-4"
          />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn how to use and customize the animation system throughout your application
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <AnimatedCard className="text-center">
            <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground mb-4">Customize animation preferences</p>
            <Link to="/animation-settings">
              <Button variant="outline">Configure</Button>
            </Link>
          </AnimatedCard>

          <AnimatedCard className="text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Demos</h3>
            <p className="text-muted-foreground mb-4">See animations in action</p>
            <Link to="/animation-showcase">
              <Button variant="outline">View Demos</Button>
            </Link>
          </AnimatedCard>

          <AnimatedCard className="text-center">
            <Code className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Documentation</h3>
            <p className="text-muted-foreground mb-4">Learn implementation details</p>
            <Button variant="outline">Read Docs</Button>
          </AnimatedCard>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                How to set up animations in your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Wrap Your App</h3>
                <p className="text-muted-foreground mb-3">
                  Wrap your main application component with the animation providers:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{codeExamples.globalWrapper}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. Use Animated Components</h3>
                <p className="text-muted-foreground mb-3">
                  Replace standard components with animated versions:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{codeExamples.animatedComponents}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Background Animations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Background Animations
              </CardTitle>
              <CardDescription>
                Different types of background effects available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Types</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Gradient:</strong> Smooth color transitions</li>
                  <li>• <strong>Particles:</strong> Floating particle field</li>
                  <li>• <strong>Blobs:</strong> Floating colored blobs</li>
                  <li>• <strong>MagicBento:</strong> Grid-based animations</li>
                  <li>• <strong>Ethereal:</strong> Subtle floating elements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Implementation</h3>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{codeExamples.backgroundUsage}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Customization</h3>
                <p className="text-muted-foreground">
                  Adjust intensity, colors, and behavior through props.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Component Animations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Component Animations
              </CardTitle>
              <CardDescription>
                Pre-built animated components for common UI elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Components</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">AnimatedCard</h4>
                    <p className="text-muted-foreground text-sm">
                      Cards with hover effects and entrance animations
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">AnimatedButton</h4>
                    <p className="text-muted-foreground text-sm">
                      Buttons with hover and tap animations
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">AnimatedText</h4>
                    <p className="text-muted-foreground text-sm">
                      Text with split, glitch, or fade animations
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Usage Example</h3>
                <AnimatedCard className="p-4 bg-muted">
                  <AnimatedText 
                    text="This is animated text!" 
                    type="split" 
                    className="text-lg font-medium mb-2"
                  />
                  <AnimatedButton>
                    Animated Button
                  </AnimatedButton>
                </AnimatedCard>
              </div>
            </CardContent>
          </Card>

          {/* Custom Animations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Custom Animations
              </CardTitle>
              <CardDescription>
                Create your own animations with Framer Motion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Animation</h3>
                <p className="text-muted-foreground mb-3">
                  Use motion components for custom animations:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{codeExamples.customAnimations}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Animation Utilities</h3>
                <p className="text-muted-foreground mb-3">
                  Import pre-built animation variants:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`import { fadeIn, slideIn, zoomIn } from '@/lib/animationUtils';

<motion.div
  variants={fadeIn('up', 'spring', 0.2, 0.5)}
  initial="hidden"
  animate="show"
/>`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Visit the <Link to="/animation-settings" className="text-primary hover:underline">Animation Settings</Link> page to customize your experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimationGuide;