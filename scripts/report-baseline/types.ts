export type QualityAnchors = {
  readonly mustMention: readonly string[];
  readonly caveats: readonly string[];
  readonly sourceBoundaries: readonly string[];
};

export type ReportQualityFixture = {
  readonly id: string;
  readonly label: string;
  readonly premiumUserData: Record<string, unknown>;
  readonly qualityAnchors: QualityAnchors;
};

export type ReportQualityFixtureFile = {
  readonly generatedAt: string;
  readonly purpose: string;
  readonly cases: readonly ReportQualityFixture[];
};

export type BaselineReportArtifact = {
  readonly id: string;
  readonly label: string;
  readonly sourceFixtureId: string;
  readonly generatedAt: string;
  readonly premiumUserData: Record<string, unknown>;
  readonly qualityAnchors: QualityAnchors;
  readonly report: {
    readonly summary: { readonly title: string; readonly content: string };
    readonly sections: readonly {
      readonly family: 'saju' | 'astrology' | 'tarot' | 'sourceBoundary';
      readonly title: string;
      readonly content: string;
    }[];
    readonly phaseOnePayload: Record<string, unknown>;
  };
};

export type BaselineIndex = {
  readonly generatedAt: string;
  readonly sourcePath: string;
  readonly artifactDir: string;
  readonly cases: readonly {
    readonly id: string;
    readonly label: string;
    readonly artifactPath: string;
  }[];
};
