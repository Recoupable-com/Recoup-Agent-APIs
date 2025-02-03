import supabase from "../supabase/serverClient";

const getAggregatedAgentSocials = async (agentId: string) => {
  try {
    const { data: agent } = await supabase
      .from("agents")
      .select("*, agent_status(*, social:socials(*))")
      .eq("id", agentId)
      .single();

    if (!agent)
      return {
        username: null,
        avatar: null,
        followerCount: 0,
      };

    const followerCount = agent.agent_status.reduce(
      // eslint-disable-next-line
      (sum: any, ele: any) => sum + ele.social.followerCount,
      0,
    );
    const username =
      // eslint-disable-next-line
      agent.agent_status.find((ele: any) => ele.social.username)?.social
        ?.username || "";
    const avatar =
      // eslint-disable-next-line
      agent.agent_status.find((ele: any) => ele.social.avatar)?.social
        ?.avatar || "";

    return {
      username,
      followerCount,
      avatar,
    };
  } catch (error) {
    console.error(error);
    return {
      username: null,
      avatar: null,
      followerCount: 0,
    };
  }
};

export default getAggregatedAgentSocials;
