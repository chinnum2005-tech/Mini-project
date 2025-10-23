import React, { useState } from 'react';
import { useAnimation } from '../providers/AnimationProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Palette, Zap, Sparkles, Layers } from 'lucide-react';

const AnimationSettings = () => {
  const { animationsEnabled, setAnimationsEnabled, prefersReducedMotion, toggleAnimations } = useAnimation();
  const [settings, setSettings] = useState({
    backgroundType: 'gradient',
    backgroundIntensity: 50,
    clickSparkEnabled: true,
    textAnimations: true,
    glitchEffects: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const backgroundTypes = [
    { value: 'gradient', label: 'Gradient Waves' },
    { value: 'particles', label: 'Particle Field' },
    { value: 'blobs', label: 'Floating Blobs' },
    { value: 'magicbento', label: 'Magic Grid' },
    { value: 'ethereal', label: 'Ethereal' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Animation Settings</h1>
          <p className="text-muted-foreground">
            Customize the visual effects and animations throughout the application
          </p>
        </div>

        {prefersReducedMotion && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-600 dark:text-yellow-400">
              Your system preferences are set to reduce motion. Some animations may be limited.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Animation Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Global Animations
              </CardTitle>
              <CardDescription>
                Enable or disable all animations in the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations-toggle">Enable Animations</Label>
                <Switch
                  id="animations-toggle"
                  checked={animationsEnabled}
                  onCheckedChange={toggleAnimations}
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Background Effects
              </CardTitle>
              <CardDescription>
                Choose your preferred background animation style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Background Type</Label>
                <Select 
                  value={settings.backgroundType} 
                  onValueChange={(value) => handleSettingChange('backgroundType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background type" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Intensity: {settings.backgroundIntensity}%</Label>
                <Slider
                  value={[settings.backgroundIntensity]}
                  onValueChange={([value]) => handleSettingChange('backgroundIntensity', value)}
                  max={100}
                  step={10}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Effects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Interactive Effects
              </CardTitle>
              <CardDescription>
                Configure interactive animations and effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="click-spark">Click Spark Effect</Label>
                <Switch
                  id="click-spark"
                  checked={settings.clickSparkEnabled}
                  onCheckedChange={(checked) => handleSettingChange('clickSparkEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="text-animations">Text Animations</Label>
                <Switch
                  id="text-animations"
                  checked={settings.textAnimations}
                  onCheckedChange={(checked) => handleSettingChange('textAnimations', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="glitch-effects">Glitch Effects</Label>
                <Switch
                  id="glitch-effects"
                  checked={settings.glitchEffects}
                  onCheckedChange={(checked) => handleSettingChange('glitchEffects', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See your settings in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50 min-h-[120px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    {settings.glitchEffects ? (
                      <span className="text-foreground glitch-text" data-text="BlockLearn">
                        BlockLearn
                      </span>
                    ) : (
                      "BlockLearn"
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {animationsEnabled ? "Animations are enabled" : "Animations are disabled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Settings</Button>
        </div>
      </div>

      <style jsx>{`
        .glitch-text {
          position: relative;
          color: hsl(var(--foreground));
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 red;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 blue;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% { clip: rect(42px, 9999px, 44px, 0); }
          5% { clip: rect(12px, 9999px, 59px, 0); }
          10% { clip: rect(48px, 9999px, 29px, 0); }
          15% { clip: rect(42px, 9999px, 73px, 0); }
          20% { clip: rect(63px, 9999px, 27px, 0); }
          25% { clip: rect(34px, 9999px, 55px, 0); }
          30% { clip: rect(86px, 9999px, 73px, 0); }
          35% { clip: rect(20px, 9999px, 20px, 0); }
          40% { clip: rect(26px, 9999px, 60px, 0); }
          45% { clip: rect(25px, 9999px, 66px, 0); }
          50% { clip: rect(57px, 9999px, 98px, 0); }
          55% { clip: rect(5px, 9999px, 46px, 0); }
          60% { clip: rect(82px, 9999px, 31px, 0); }
          65% { clip: rect(54px, 9999px, 27px, 0); }
          70% { clip: rect(28px, 9999px, 99px, 0); }
          75% { clip: rect(45px, 9999px, 69px, 0); }
          80% { clip: rect(23px, 9999px, 85px, 0); }
          85% { clip: rect(1px, 9999px, 83px, 0); }
          90% { clip: rect(72px, 9999px, 11px, 0); }
          95% { clip: rect(60px, 9999px, 88px, 0); }
          100% { clip: rect(93px, 9999px, 54px, 0); }
        }
        @keyframes glitch-anim2 {
          0% { clip: rect(65px, 9999px, 100px, 0); }
          5% { clip: rect(52px, 9999px, 74px, 0); }
          10% { clip: rect(79px, 9999px, 85px, 0); }
          15% { clip: rect(75px, 9999px, 5px, 0); }
          20% { clip: rect(67px, 9999px, 61px, 0); }
          25% { clip: rect(14px, 9999px, 79px, 0); }
          30% { clip: rect(1px, 9999px, 66px, 0); }
          35% { clip: rect(86px, 9999px, 30px, 0); }
          40% { clip: rect(23px, 9999px, 98px, 0); }
          45% { clip: rect(85px, 9999px, 72px, 0); }
          50% { clip: rect(71px, 9999px, 75px, 0); }
          55% { clip: rect(2px, 9999px, 48px, 0); }
          60% { clip: rect(30px, 9999px, 16px, 0); }
          65% { clip: rect(59px, 9999px, 50px, 0); }
          70% { clip: rect(41px, 9999px, 62px, 0); }
          75% { clip: rect(2px, 9999px, 82px, 0); }
          80% { clip: rect(47px, 9999px, 73px, 0); }
          85% { clip: rect(3px, 9999px, 27px, 0); }
          90% { clip: rect(26px, 9999px, 55px, 0); }
          95% { clip: rect(42px, 9999px, 97px, 0); }
          100% { clip: rect(38px, 9999px, 49px, 0); }
        }
      `}</style>
    </div>
  );
};

export default AnimationSettings;