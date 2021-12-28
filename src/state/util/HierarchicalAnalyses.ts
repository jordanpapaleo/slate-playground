interface Proto<A> {
  new (): A;
}

export default class HierarchicalAnalyses<A> {
  analysis?: A;
  children: (HierarchicalAnalyses<A> | undefined)[];

  constructor() {
    this.children = [];
  }

  // Return true if this layer has no children that have an attached analysis.
  hasNoChildren() {
    return !this.children.some((layer) => layer?.analysis);
  }

  // Get access to an analysis of type A for the given path.
  // If that layer does not yet exist, this operation implicitly creates it.
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

  // Put the given analysis at the given hierarchical path.
  // If that layer does not yet exist, this operation implicitly creates it.
  put(analysis: A, path: number[], pathProgress = 0): void {
    // If we've finished walking down the levels of the path, stop walking now.
    // Assign the given analysis.
    if (path.length === pathProgress) {
      this.analysis = analysis;
      return;
    }

    // Otherwise, get or create the child for the next step of the hierarchy.
    const childIndex = path[pathProgress];
    let child = this.children[childIndex];
    if (!child) {
      child = new HierarchicalAnalyses<A>();
      this.children[childIndex] = child;
    }

    // Recursively finish resolving the analysis for the path.
    return child.put(analysis, path, pathProgress + 1);
  }

  maybeDelete(
    path: number[],
    checkShouldDelete: (analysis: A) => boolean,
    pathProgress = 0
  ): void {
    // If we've finished walking down the levels of the path, stop walking now.
    // Remove the given analysis.
    if (path.length === pathProgress) {
      const analysis = this.analysis;
      if (analysis && checkShouldDelete(analysis)) {
        this.analysis = undefined;
      }
      return;
    }

    // Otherwise, get or create the child for the next step of the hierarchy.
    const childIndex = path[pathProgress];
    let child = this.children[childIndex];
    if (!child) {
      child = new HierarchicalAnalyses<A>();
      this.children[childIndex] = child;
    }

    // Recursively finish resolving the analysis for the path.
    return child.delete(path, pathProgress + 1);
  }

  // Delete the given analysis at the given hierarchical path.
  // If that layer does not yet exist, this operation does nothing.
  delete(path: number[], pathProgress = 0): void {
    // If we've finished walking down the levels of the path, stop walking now.
    // Remove the given analysis.
    if (path.length === pathProgress) {
      this.analysis = undefined;
      return;
    }

    // Otherwise, get or create the child for the next step of the hierarchy.
    const childIndex = path[pathProgress];
    let child = this.children[childIndex];
    if (!child) {
      child = new HierarchicalAnalyses<A>();
      this.children[childIndex] = child;
    }

    // Recursively finish resolving the analysis for the path.
    return child.delete(path, pathProgress + 1);
  }
}
