interface Proto<A> {
  new (): A;
}

export default class HierarchicalAnalyses<A> {
  analysis?: A;
  children: (HierarchicalAnalyses<A> | undefined)[];
  interestCount: number;

  constructor() {
    this.children = [];
    this.interestCount = 1;
  }

  // Get access to an analysis of type A for the given path.
  //
  // If such analysis does not yet exist, this operation implicitly creates it
  // and sets its interestCount to 1.
  //
  // It will continue to exist until its interestCount drops to zero.
  getOrCreate(protoA: Proto<A>, path: number[], pathProgress = 0): A {
    // If we've finished walking down the levels of the path, stop walking now.
    if (path.length === pathProgress) {
      // Return the existing analysis if it does indeed exist.
      if (this.analysis) return this.analysis;

      // Otherwise create a new analysis, store it, and return it.
      const newAnalysis = new protoA();
      this.analysis = newAnalysis;
      return newAnalysis;
    }

    // Otherwise, get or create the child for the next step of the hierarchy.
    const childIndex = path[pathProgress];
    let child = this.children[childIndex];
    if (!child) {
      child = new HierarchicalAnalyses<A>();
      this.children[childIndex] = child;
    }

    // Recursively finish resolving the analysis for the path.
    return child.getOrCreate(protoA, path, pathProgress + 1);
  }
}
