const getSegmentsTotalSize = (segments: any) => {
  return (
    segments.reduce((sum: any, segment: any) => sum + segment.size, 0) || 1
  );
};

export default getSegmentsTotalSize;
