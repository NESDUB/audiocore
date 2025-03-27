import React from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';
import { User, Edit, Clock, Music, BarChart2, Star, Calendar, Mail, Globe, Link } from 'lucide-react';

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow: auto;
  height: 100%;
`;

const ProfileSidebar = styled(Panel)`
  grid-row: span 2;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--borderSubtle);
`;

const ProfileAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--bgPrimary);
  margin-bottom: var(--spacing-md);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accentPrimary);
`;

const AvatarIcon = styled.div`
  color: var(--textSecondary);
`;

const EditButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--accentPrimary);
  color: ${(props) => (props.theme === 'dark' ? 'black' : 'white')};
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--accentHighlight);
  }
`;

const ProfileName = styled.h2`
  font-size: 24px;
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: var(--spacing-xs);
  text-align: center;
`;

const ProfileUsername = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
  margin-bottom: var(--spacing-md);
`;

const ProfileBio = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
  text-align: center;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const ProfileStats = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: var(--spacing-md) 0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--textPrimary);
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
`;

const ProfileInfo = styled.div`
  padding: var(--spacing-md);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  
  svg {
    color: var(--textSecondary);
  }
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: var(--textPrimary);
`;

const ActivityPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: var(--spacing-md);
`;

const ActivityTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ActivityCard = styled.div`
  display: flex;
  gap: var(--spacing-md);
  background-color: var(--bgSecondary);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--borderSubtle);
`;

const ActivityIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${props => props.$bgColor || 'var(--bgHover)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$iconColor || 'var(--textPrimary)'};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
`;

const ActivityTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--textPrimary);
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
`;

const ActivityDescription = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
`;

const FavoriteGenres = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
`;

const GenreTag = styled.div`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 16px;
  background-color: var(--bgHover);
  color: var(--textSecondary);
  font-size: 12px;
`;

const ProfilePage = () => {
  return (
    <PageContainer>
      <ProfileSidebar title="PROFILE">
        <ProfileHeader>
          <ProfileAvatar>
            <AvatarIcon>
              <User size={50} />
            </AvatarIcon>
            <EditButton>
              <Edit size={16} />
            </EditButton>
          </ProfileAvatar>
          
          <ProfileName>Alex Johnson</ProfileName>
          <ProfileUsername>@audiocore_user</ProfileUsername>
          
          <ProfileBio>
            Music enthusiast and avid collector. Always exploring new sounds and genres.
          </ProfileBio>
          
          <ProfileStats>
            <StatItem>
              <StatValue>238</StatValue>
              <StatLabel>Albums</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>42</StatValue>
              <StatLabel>Playlists</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>846h</StatValue>
              <StatLabel>Listened</StatLabel>
            </StatItem>
          </ProfileStats>
        </ProfileHeader>
        
        <ProfileInfo>
          <SectionTitle>Personal Information</SectionTitle>
          
          <InfoItem>
            <Calendar size={16} />
            <InfoValue>Member since January 2023</InfoValue>
          </InfoItem>
          
          <InfoItem>
            <Mail size={16} />
            <InfoValue>user@example.com</InfoValue>
          </InfoItem>
          
          <InfoItem>
            <Globe size={16} />
            <InfoValue>San Francisco, CA</InfoValue>
          </InfoItem>
          
          <InfoItem>
            <Link size={16} />
            <InfoValue>audiophile.blog</InfoValue>
          </InfoItem>
          
          <SectionTitle style={{ marginTop: 'var(--spacing-lg)' }}>Favorite Genres</SectionTitle>
          
          <FavoriteGenres>
            <GenreTag>Electronic</GenreTag>
            <GenreTag>Ambient</GenreTag>
            <GenreTag>Jazz</GenreTag>
            <GenreTag>Classical</GenreTag>
            <GenreTag>Rock</GenreTag>
            <GenreTag>Indie</GenreTag>
          </FavoriteGenres>
        </ProfileInfo>
      </ProfileSidebar>
      
      <ActivityPanel title="RECENT ACTIVITY">
        <ActivityTimeline>
          <ActivityCard>
            <ActivityIconWrapper $bgColor="rgba(145, 242, 145, 0.2)" $iconColor="var(--accentPrimary)">
              <Music size={20} />
            </ActivityIconWrapper>
            
            <ActivityContent>
              <ActivityHeader>
                <ActivityTitle>Listened to Album</ActivityTitle>
                <ActivityTime>2 hours ago</ActivityTime>
              </ActivityHeader>
              
              <ActivityDescription>
                You listened to "Ambient Waves" by Ocean Sound Collective
              </ActivityDescription>
            </ActivityContent>
          </ActivityCard>
          
          <ActivityCard>
            <ActivityIconWrapper $bgColor="rgba(93, 125, 242, 0.2)" $iconColor="var(--accentHighlight)">
              <Star size={20} />
            </ActivityIconWrapper>
            
            <ActivityContent>
              <ActivityHeader>
                <ActivityTitle>Added to Favorites</ActivityTitle>
                <ActivityTime>Yesterday</ActivityTime>
              </ActivityHeader>
              
              <ActivityDescription>
                You added "Midnight Jazz" to your favorites
              </ActivityDescription>
            </ActivityContent>
          </ActivityCard>
          
          <ActivityCard>
            <ActivityIconWrapper $bgColor="rgba(242, 203, 5, 0.2)" $iconColor="var(--accentWarning)">
              <BarChart2 size={20} />
            </ActivityIconWrapper>
            
            <ActivityContent>
              <ActivityHeader>
                <ActivityTitle>New Listening Record</ActivityTitle>
                <ActivityTime>3 days ago</ActivityTime>
              </ActivityHeader>
              
              <ActivityDescription>
                You listened to 6.5 hours of music in one day
              </ActivityDescription>
            </ActivityContent>
          </ActivityCard>
          
          <ActivityCard>
            <ActivityIconWrapper $bgColor="rgba(145, 242, 145, 0.2)" $iconColor="var(--accentPrimary)">
              <Music size={20} />
            </ActivityIconWrapper>
            
            <ActivityContent>
              <ActivityHeader>
                <ActivityTitle>Discovered New Artist</ActivityTitle>
                <ActivityTime>5 days ago</ActivityTime>
              </ActivityHeader>
              
              <ActivityDescription>
                You listened to "Electronic Dreams" by Nebula Synth for the first time
              </ActivityDescription>
            </ActivityContent>
          </ActivityCard>
        </ActivityTimeline>
      </ActivityPanel>
      
      <Panel title="LISTENING HABITS">
        <div style={{ padding: 'var(--spacing-md)' }}>
          <SectionTitle>Your Listening Summary</SectionTitle>
          
          <p style={{ color: 'var(--textSecondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: 'var(--spacing-md)' }}>
            Based on your listening history, you tend to listen to music most frequently in the evenings,
            with peak listening hours between 8PM and 11PM. Your favorite day for music is Saturday,
            when you average 3.2 hours of listening time.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-lg)'
          }}>
            <div style={{ 
              backgroundColor: 'var(--bgSecondary)', 
              padding: 'var(--spacing-md)', 
              borderRadius: 'var(--spacing-sm)',
              border: '1px solid var(--borderSubtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                <Clock size={16} color="var(--accentPrimary)" />
                <span style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>Peak Listening Time</span>
              </div>
              <div style={{ fontSize: '18px', color: 'var(--textPrimary)', fontWeight: '500' }}>8PM - 11PM</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'var(--bgSecondary)', 
              padding: 'var(--spacing-md)', 
              borderRadius: 'var(--spacing-sm)',
              border: '1px solid var(--borderSubtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                <Calendar size={16} color="var(--accentHighlight)" />
                <span style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>Favorite Day</span>
              </div>
              <div style={{ fontSize: '18px', color: 'var(--textPrimary)', fontWeight: '500' }}>Saturday</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'var(--bgSecondary)', 
              padding: 'var(--spacing-md)', 
              borderRadius: 'var(--spacing-sm)',
              border: '1px solid var(--borderSubtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                <Music size={16} color="var(--accentWarning)" />
                <span style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>Top Genre</span>
              </div>
              <div style={{ fontSize: '18px', color: 'var(--textPrimary)', fontWeight: '500' }}>Electronic</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'var(--bgSecondary)', 
              padding: 'var(--spacing-md)', 
              borderRadius: 'var(--spacing-sm)',
              border: '1px solid var(--borderSubtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                <BarChart2 size={16} color="var(--accentError)" />
                <span style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>Weekly Average</span>
              </div>
              <div style={{ fontSize: '18px', color: 'var(--textPrimary)', fontWeight: '500' }}>14.5 hours</div>
            </div>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
};

export default ProfilePage;