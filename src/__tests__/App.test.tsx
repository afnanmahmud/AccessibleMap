import { render, screen } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import App from '../App';

// Mock all OpenLayers modules
vi.mock('ol/Map', () => ({
  default: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    setView: vi.fn(),
    getView: vi.fn().mockReturnValue({
      fit: vi.fn(),
    }),
    addLayer: vi.fn(),
  })),
}));

vi.mock('ol/View', () => ({
  default: vi.fn().mockImplementation(() => ({
    fit: vi.fn(),
  })),
}));

vi.mock('ol/layer/Tile', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/layer/Vector', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/source/Vector', () => ({
  default: vi.fn().mockImplementation(() => ({
    addFeature: vi.fn(),
  })),
}));

vi.mock('ol/source/OSM', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/Feature', () => ({
  default: vi.fn().mockImplementation(() => ({
    setStyle: vi.fn(),
  })),
}));

vi.mock('ol/geom/Point', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/geom/LineString', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/style/Style', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/style/Icon', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/style/Stroke', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('ol/proj', () => ({
  fromLonLat: vi.fn().mockImplementation((coords: number[]) => coords),
}));

// Mock openrouteservice-js
vi.mock('openrouteservice-js', () => {
  console.log('Mocking openrouteservice-js in App.test.tsx');
  const MockDirections = class {
    calculate: () => Promise<{
      routes: Array<{
        geometry: string;
        summary: { totalDistance: number; totalTime: number };
        segments: any[];
      }>;
    }>;
    constructor() {
      this.calculate = vi.fn().mockResolvedValue({
        routes: [
          {
            geometry: 'mocked-geometry',
            summary: { totalDistance: 1000, totalTime: 300 },
            segments: [],
          },
        ],
      });
    }
  };
  const MockOpenrouteservice = class {
    static Directions = MockDirections;
  };
  return {
    default: MockOpenrouteservice,
  };
});

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    get: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

test('renders App component', () => {
  render(<App />);
  expect(screen.getByPlaceholderText('Start')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('End')).toBeInTheDocument();
});