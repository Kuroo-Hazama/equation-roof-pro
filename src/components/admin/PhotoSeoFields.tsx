import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import KeywordsInput from "./KeywordsInput";

type Props = {
  altText: string;
  keywords: string[];
  caption?: string;
  showCaption?: boolean;
  suggestions?: string[];
  onAltChange: (v: string) => void;
  onAltBlur?: (v: string) => void;
  onKeywordsChange: (v: string[]) => void;
  onKeywordsCommit?: (v: string[]) => void;
  onCaptionChange?: (v: string) => void;
  onCaptionBlur?: (v: string) => void;
};

const PhotoSeoFields = ({
  altText,
  keywords,
  caption = "",
  showCaption = true,
  suggestions,
  onAltChange,
  onAltBlur,
  onKeywordsChange,
  onKeywordsCommit,
  onCaptionChange,
  onCaptionBlur,
}: Props) => {
  const altMissing = !altText.trim();
  return (
    <div className="space-y-2 p-2.5 bg-muted/30">
      <div>
        <Label className="text-xs flex items-center gap-1">
          Texte alternatif (SEO) <span className="text-destructive">*</span>
        </Label>
        <Input
          value={altText}
          onChange={(e) => onAltChange(e.target.value)}
          onBlur={(e) => onAltBlur?.(e.target.value)}
          placeholder="Décrivez l'image en une phrase courte"
          className={`mt-1 text-sm ${altMissing ? "border-destructive/60" : ""}`}
        />
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Important pour Google et l'accessibilité
        </p>
      </div>
      <div>
        <Label className="text-xs">Mots-clés</Label>
        <KeywordsInput
          value={keywords}
          onChange={onKeywordsChange}
          onCommit={onKeywordsCommit}
          suggestions={suggestions}
          className="mt-1"
        />
      </div>
      {showCaption && onCaptionChange && (
        <div>
          <Label className="text-xs">Légende affichée (optionnel)</Label>
          <Input
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            onBlur={(e) => onCaptionBlur?.(e.target.value)}
            placeholder="Sous l'image"
            className="mt-1 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoSeoFields;
