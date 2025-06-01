import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const funFacts = [
  "The first computer bug was an actual bug - a moth trapped in a Harvard Mark II computer in 1947.",
  "The world's first website is still online at info.cern.ch.",
  "A 1 GB flash drive would have cost $10,000 in the year 2000.",
  "The QWERTY keyboard layout was designed to slow typing and prevent typewriter jams.",
  "More than 90% of the world's currency is digital.",
  "The first computer programmer was a woman - Ada Lovelace.",
  "The average person blinks 20 times per minute, but only 7 times when using a computer.",
  "The first web browser was called 'WorldWideWeb' and was created by Tim Berners-Lee in 1990.",
  "The Firefox logo isn't a fox. It's actually a red panda.",
  "The term 'bug' to describe computer glitches was popularized by Grace Hopper.",
  "The first 1 GB hard disk drive was announced in 1980 and weighed 550 pounds.",
  "More Google searches are done on mobile devices than on computers.",
  "The Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) was created in 1986.",
  "An average web page today requires over 87 HTTP requests.",
  "The first smartphone was created by IBM in 1992 called the Simon Personal Communicator.",
  "The first computer mouse was made of wood.",
  "YouTube was founded by former PayPal employees.",
  "The term 'robot' comes from the Czech word 'robota' meaning forced labor.",
  "The first computer game was created in 1961 called 'Spacewar!'",
  "75% of all JavaScript errors occur in Internet Explorer 6-8."
];

const LoadingScreen = ({ duration = 250 }) => {
  const [fact, setFact] = useState('');
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Select a random fact
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFact(randomFact);
    
    // Show the loader after a brief delay to avoid flickering on fast loads
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, duration);
    
    // Animated progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.08;
        return newProgress > 99 ? 99 : newProgress;
      });
    }, 100);
    
    return () => {
      clearTimeout(showTimer);
      clearInterval(progressInterval);
    };
  }, [duration]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background/95 to-background transition-opacity duration-300 backdrop-blur-sm">
      <div className="w-full max-w-md px-4">
        <Card className="border-muted-foreground/20 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              <div className="flex items-center justify-center gap-2">
                <span>Loading</span>
                <span className="relative flex h-3 w-12">
                  <span className="absolute inline-flex h-3 w-3 animate-bounce rounded-full bg-primary opacity-75 delay-100"></span>
                  <span className="absolute inline-flex h-3 w-3 animate-bounce rounded-full bg-primary opacity-75 left-4 delay-200"></span>
                  <span className="absolute inline-flex h-3 w-3 animate-bounce rounded-full bg-primary opacity-75 left-8 delay-300"></span>
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-0">
            <div className="flex justify-center py-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Loading content</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="rounded-lg bg-muted p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                  Did you know?
                </Badge>
              </div>
              <p className="text-sm leading-relaxed italic text-muted-foreground">
                "{fact}"
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="justify-center border-t border-border/40 pt-4">
            <p className="text-xs text-center text-muted-foreground animate-pulse">
              Kushi-Dash is preparing your experience
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoadingScreen;