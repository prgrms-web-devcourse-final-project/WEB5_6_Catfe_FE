declare interface DisplayMediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
  preferCurrentTab?: boolean;
  selfBrowserSurface?: 'include' | 'exclude';
  systemAudio?: 'include' | 'exclude';
  surfaceSwitching?: 'include' | 'exclude';
  monitorTypeSurfaces?: 'include' | 'exclude';
}

interface MediaDevices {
  getDisplayMedia?(constraints?: DisplayMediaStreamConstraints): Promise<MediaStream>;
}
interface Navigator {
  getDisplayMedia?: (constraints?: DisplayMediaStreamConstraints) => Promise<MediaStream>;
}
