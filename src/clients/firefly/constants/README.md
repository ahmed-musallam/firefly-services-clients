# Firefly API Constants

This directory contains constants for all Firefly API string literal parameters. These constants provide type-safe, autocomplete-friendly access to valid parameter values.

## Usage

### Import Constants

```typescript
import {
  CameraMotion,
  PromptStyle,
  ShotAngle,
  ShotSize,
  ModelVersion,
  VideoModelVersion,
  JobStatus,
} from '../../../lib/clients/firefly';
```

### In Your Frontend

```typescript
import { CameraMotion, ShotAngle, FireflyProxyClient } from '../utils/fireflyProxyClient';

// Use constants for type-safe parameter values
const client = new FireflyProxyClient({ imsToken, imsOrgId });

await client.generateVideoAsync({
  prompt: 'a mountain landscape',
  sizes: [{ width: 1920, height: 1080 }],
  videoSettings: {
    cameraMotion: CameraMotion.ZOOM_IN, // ✅ Type-safe
    shotAngle: ShotAngle.AERIAL, // ✅ Autocomplete works!
  },
});
```

### Building UI Components

Use constants to populate dropdowns, radio buttons, etc:

```tsx
import { ShotAngle } from '../utils/fireflyProxyClient';

// Get all available shot angles
const shotAngleOptions = Object.entries(ShotAngle).map(([key, value]) => ({
  id: key,
  label: value,
  value: value,
}));

// Render in a Spectrum Picker
<Picker label="Shot angle" value={shotAngle} onChange={setShotAngle}>
  {shotAngleOptions.map((option) => (
    <PickerItem key={option.id} id={option.value}>
      {option.label}
    </PickerItem>
  ))}
</Picker>;
```

## Available Constants

### CameraMotion

Video camera movement options:

- `CameraMotion.PAN_LEFT` - "camera pan left"
- `CameraMotion.PAN_RIGHT` - "camera pan right"
- `CameraMotion.ZOOM_IN` - "camera zoom in"
- `CameraMotion.ZOOM_OUT` - "camera zoom out"
- `CameraMotion.TILT_UP` - "camera tilt up"
- `CameraMotion.TILT_DOWN` - "camera tilt down"
- `CameraMotion.LOCKED_DOWN` - "camera locked down"
- `CameraMotion.HANDHELD` - "camera handheld"

### PromptStyle

Visual style options:

- `PromptStyle.ANIME` - "anime"
- `PromptStyle.THREE_D` - "3d"
- `PromptStyle.FANTASY` - "fantasy"
- `PromptStyle.CINEMATIC` - "cinematic"
- `PromptStyle.CLAYMATION` - "claymation"
- `PromptStyle.LINE_ART` - "line art"
- `PromptStyle.STOP_MOTION` - "stop motion"
- `PromptStyle.TWO_D` - "2d"
- `PromptStyle.VECTOR_ART` - "vector art"
- `PromptStyle.BLACK_AND_WHITE` - "black and white"

### ShotAngle

Camera angle options:

- `ShotAngle.AERIAL` - "aerial shot"
- `ShotAngle.EYE_LEVEL` - "eye_level shot"
- `ShotAngle.HIGH_ANGLE` - "high angle shot"
- `ShotAngle.LOW_ANGLE` - "low angle shot"
- `ShotAngle.TOP_DOWN` - "top-down shot"

### ShotSize

Camera shot size options:

- `ShotSize.CLOSE_UP` - "close-up shot"
- `ShotSize.EXTREME_CLOSE_UP` - "extreme close-up"
- `ShotSize.MEDIUM` - "medium shot"
- `ShotSize.LONG` - "long shot"
- `ShotSize.EXTREME_LONG` - "extreme long shot"

### ModelVersion

Image model versions:

- `ModelVersion.IMAGE3` - "image3"
- `ModelVersion.IMAGE3_CUSTOM` - "image3_custom"
- `ModelVersion.IMAGE4_STANDARD` - "image4_standard"
- `ModelVersion.IMAGE4_ULTRA` - "image4_ultra"
- `ModelVersion.IMAGE4_CUSTOM` - "image4_custom"

### VideoModelVersion

Video model versions:

- `VideoModelVersion.VIDEO1_STANDARD` - "video1_standard"

### JobStatus

Job status values:

- `JobStatus.PENDING` - "pending"
- `JobStatus.RUNNING` - "running"
- `JobStatus.SUCCEEDED` - "succeeded"
- `JobStatus.FAILED` - "failed"
- `JobStatus.CANCELED` - "canceled"

## Benefits

✅ **Type Safety**: TypeScript will catch invalid values at compile time  
✅ **Autocomplete**: IDE shows all available options  
✅ **Refactor-Safe**: Renaming a constant updates all usages  
✅ **Single Source of Truth**: String values defined once  
✅ **Easy to Iterate**: Use `Object.entries()` or `Object.values()` to build UI

## Pattern

All constants follow this pattern:

```typescript
export const ConstantName = {
  KEY_NAME: 'api value',
  // ...
} as const;

export type ConstantName = (typeof ConstantName)[keyof typeof ConstantName];
```

This creates both:

- A constant object with all values
- A TypeScript type that matches the union of all values
