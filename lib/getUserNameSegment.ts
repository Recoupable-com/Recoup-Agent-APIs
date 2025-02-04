const getUserNameSegment = (fanSegment: any) => {
  let segmentName: any = "";
  let username: any = "";

  if (Object.keys(fanSegment).length === 1) {
    segmentName = Object.values(fanSegment)[0] || "";
    username = Object.keys(fanSegment)[0] || "";
  }

  if (Object.keys(fanSegment).length === 2) {
    segmentName =
      fanSegment?.segment ||
      fanSegment?.segmentName ||
      fanSegment?.segment_name ||
      fanSegment?.segmentname ||
      "";
    username = fanSegment?.username;
  }

  return {
    username,
    segmentName,
  };
};

export default getUserNameSegment;
