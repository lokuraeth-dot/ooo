import React, { useState, FormEvent, useCallback } from 'react';
import { generatePixarImages } from './services/geminiService';
import { ImageIcon, SparklesIcon, SpinnerIcon, ErrorIcon, DownloadIcon, AspectRatio16x9Icon, AspectRatio1x1Icon, AspectRatio9x16Icon } from './components/IconComponents';

type AspectRatio = '16:9' | '1:1' | '9:16';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [variationError, setVariationError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedImageAspectRatio, setGeneratedImageAspectRatio] = useState<AspectRatio>('16:9');

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setVariations([]);
    setVariationError(null);

    try {
      const [generatedImageBase64] = await generatePixarImages(prompt, aspectRatio, 1);
      if (generatedImageBase64) {
        setImageUrl(`data:image/jpeg;base64,${generatedImageBase64}`);
        setGeneratedImageAspectRatio(aspectRatio);
      } else {
        throw new Error("API did not return a valid image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, aspectRatio]);

  const handleGenerateVariations = useCallback(async () => {
    if (!prompt.trim() || isLoading || isGeneratingVariations) {
      return;
    }

    setIsGeneratingVariations(true);
    setVariationError(null);
    setVariations([]);

    try {
      // Generate 3 new variations
      const variationImages = await generatePixarImages(prompt, generatedImageAspectRatio, 3);
      setVariations(variationImages.map(img => `data:image/jpeg;base64,${img}`));
    } catch (err) {
      setVariationError(err instanceof Error ? err.message : 'An unexpected error occurred while generating variations.');
      console.error(err);
    } finally {
      setIsGeneratingVariations(false);
    }
  }, [prompt, isLoading, isGeneratingVariations, generatedImageAspectRatio]);

  const downloadImage = useCallback((url: string, fileName: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDownload = useCallback(() => {
    const fileName = prompt.trim().toLowerCase().replace(/\s+/g, '-') || 'generated-pixar-image';
    downloadImage(imageUrl!, fileName);
  }, [imageUrl, prompt, downloadImage]);

  const handleDownloadVariation = useCallback((url: string, index: number) => {
    const fileName = prompt.trim().toLowerCase().replace(/\s+/g, '-') || 'generated-pixar-image';
    downloadImage(url, `${fileName}-variation-${index + 1}`);
  }, [prompt, downloadImage]);


  const aspectRatioClasses: Record<AspectRatio, string> = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-4 mb-4">
            <ImageIcon className="w-10 h-10 text-cyan-300" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              3D Pixar Style Image Generator
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Bring your imagination to life. Describe a scene, character, or idea to generate a stunning, cinematic 3D image.
          </p>
        </header>

        <main>
          <div className="sticky top-6 z-10 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl shadow-2xl shadow-slate-900/50 ring-1 ring-slate-700/50 mb-12">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A brave squirrel knight with an acorn sword"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all duration-300 placeholder-slate-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="animate-spin w-5 h-5" />
                      <span>Generating...</span>
                    </>
                  ) : (
                     <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Generate</span>
                     </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="text-sm font-medium text-slate-400">Aspect Ratio:</span>
                {(['16:9', '1:1', '9:16'] as AspectRatio[]).map((ratio) => {
                  const isActive = aspectRatio === ratio;
                  const icons: Record<AspectRatio, React.ReactNode> = {
                    '16:9': <AspectRatio16x9Icon className="w-5 h-5" />,
                    '1:1': <AspectRatio1x1Icon className="w-5 h-5" />,
                    '9:16': <AspectRatio9x16Icon className="w-5 h-5" />
                  };
                  return (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      disabled={isLoading}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {icons[ratio]}
                      {ratio}
                    </button>
                  );
                })}
              </div>
            </form>
          </div>
          
          <div className="mt-8 flex flex-col items-center">
            {isLoading && (
               <div className="text-center text-slate-400 flex flex-col items-center justify-center gap-4 p-8" role="status">
                  <SpinnerIcon className="animate-spin w-12 h-12 text-pink-500" />
                  <p className="text-xl">Crafting your masterpiece... Please wait.</p>
                  <p className="text-sm text-slate-500">(This can take a moment)</p>
               </div>
            )}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-start gap-3 max-w-2xl mx-auto">
                <ErrorIcon className="w-6 h-6 flex-shrink-0 mt-0.5"/>
                <span className="font-semibold">{error}</span>
              </div>
            )}
            {imageUrl && !isLoading && (
              <div className="w-full flex flex-col items-center gap-6 p-4">
                <div className={`relative w-full max-w-4xl bg-slate-800 rounded-xl shadow-2xl shadow-black/50 ring-1 ring-slate-700 overflow-hidden ${aspectRatioClasses[generatedImageAspectRatio]}`}>
                    <img 
                        src={imageUrl} 
                        alt={prompt} 
                        className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      <span>Download HD Image</span>
                    </button>
                    <button
                      onClick={handleGenerateVariations}
                      disabled={isGeneratingVariations}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                    >
                      {isGeneratingVariations ? (
                        <>
                          <SpinnerIcon className="animate-spin w-5 h-5" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          <span>Generate Variations</span>
                        </>
                      )}
                    </button>
                </div>
              </div>
            )}
            {isGeneratingVariations && (
                <div className="text-center text-slate-400 mt-8" role="status">
                    <SpinnerIcon className="animate-spin w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p>Creating new variations...</p>
                </div>
            )}
            {variationError && (
              <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-start gap-3 max-w-2xl mx-auto">
                <ErrorIcon className="w-6 h-6 flex-shrink-0 mt-0.5"/>
                <span className="font-semibold">{variationError}</span>
              </div>
            )}
            {variations.length > 0 && !isGeneratingVariations && (
              <div className="mt-12 w-full max-w-6xl">
                <h3 className="text-2xl font-bold text-center mb-6 text-slate-300">Variations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {variations.map((imgSrc, index) => (
                    <div key={index} className={`group relative bg-slate-800 rounded-xl shadow-lg ring-1 ring-slate-700 overflow-hidden ${aspectRatioClasses[generatedImageAspectRatio]}`}>
                      <img src={imgSrc} alt={`Variation ${index + 1} of ${prompt}`} className="absolute top-0 left-0 w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                              onClick={() => handleDownloadVariation(imgSrc, index)} 
                              aria-label={`Download variation ${index + 1}`}
                              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 transition-all duration-300 transform scale-90 group-hover:scale-100"
                          >
                              <DownloadIcon className="w-5 h-5" />
                              <span>Download</span>
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

             {!isLoading && !imageUrl && !error && (
                <div className="text-center text-slate-500 pt-16 flex flex-col items-center">
                    <ImageIcon className="w-24 h-24 text-slate-700 mb-4"/>
                    <h2 className="text-2xl font-semibold">Your canvas is waiting.</h2>
                    <p>Describe your vision to create a unique piece of art.</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
