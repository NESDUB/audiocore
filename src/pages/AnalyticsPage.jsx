import React, { useState } from 'react';
import styled from 'styled-components';
import Panel from '../components/layout/Panel';
import { BarChart2, PieChart, LineChart, Clock, Calendar, Music, Headphones, Radio, Medal, Disc } from 'lucide-react';

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow: auto;
  height: 100%;
`;

const PageHeader = styled.div`
  grid-column: 1 / -1;
  background-color: var(--bgContent);
  border-radius: var(--spacing-md);
  border: 1px solid var(--borderSubtle);
  padding: var(--spacing-md);
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  svg {
    color: var(--accentPrimary);
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
`;

const TimeButton = styled.button`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? 'var(--accentPrimary)' : 'transparent')};
  color: ${(props) => (props.$active ? 'black' : 'var(--textSecondary)')};
  border: 1px solid ${(props) => (props.$active ? 'var(--accentPrimary)' : 'var(--borderLight)')};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${(props) => (props.$active ? 'var(--accentHighlight)' : 'var(--bgHover)')};
    color: ${(props) => (props.$active ? 'black' : 'var(--textPrimary)')};
  }
`;

const StatCard = styled.div`
  background-color: var(--bgContent);
  border-radius: var(--spacing-sm);
  border: 1px solid var(--borderSubtle);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const StatTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  svg {
    color: var(--accentPrimary);
  }
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: var(--spacing-xs);
`;

const StatChange = styled.div`
  font-size: 14px;
  color: ${(props) => (props.$positive ? 'var(--accentPrimary)' : 'var(--accentError)')};
`;

const ChartPlaceholder = styled.div`
  background-color: var(--bgSecondary);
  border-radius: var(--spacing-sm);
  height: 200px;
  margin-top: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: var(--textDimmed);
  }
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr 80px;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--borderSubtle);
  
  span {
    font-size: 12px;
    color: var(--textSecondary);
    font-weight: 500;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr 80px;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--borderSubtle);
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--bgHover);
  }
`;

const RankNumber = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
  text-align: center;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemName = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
`;

const ItemSubtitle = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
`;

const ItemStat = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
  text-align: right;
`;

const ChartContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

// Simple bar chart visualization
const BarChartViz = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  margin-top: auto;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--borderSubtle);
`;

const BarItem = styled.div`
  width: 24px;
  height: ${props => props.$height}%;
  background-color: var(--accentPrimary);
  border-radius: 2px 2px 0 0;
  opacity: ${props => props.$selected ? '1' : '0.6'};
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    transform: scaleY(1.05);
    transform-origin: bottom;
    cursor: pointer;
  }
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
`;

const ChartLabel = styled.div`
  font-size: 10px;
  color: var(--textSecondary);
  width: 24px;
  text-align: center;
`;

// Simple area chart for listening hours
const LineChartViz = styled.div`
  position: relative;
  height: 150px;
  margin-top: auto;
  padding-bottom: var(--spacing-sm);
  margin-top: var(--spacing-lg);
`;

const LineChartPath = styled.div`
  position: absolute;
  bottom: var(--spacing-sm);
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(180deg, 
    var(--accentPrimary) 0%, 
    transparent 100%
  );
  opacity: 0.2;
  clip-path: ${props => props.$path};
`;

const PieChartViz = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  margin-top: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PieChartSlice = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    var(--accentPrimary) 0% ${props => props.$value1}%, 
    var(--accentHighlight) ${props => props.$value1}% ${props => props.$value2}%, 
    var(--accentWarning) ${props => props.$value2}% ${props => props.$value3}%, 
    var(--accentError) ${props => props.$value3}% 100%
  );
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  color: var(--textSecondary);
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.$color};
`;

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  return (
    <PageContainer>
      <PageHeader>
        <HeaderTitle>
          <BarChart2 size={24} />
          Listening Analytics
        </HeaderTitle>
        
        <TimeRangeSelector>
          <TimeButton 
            $active={timeRange === 'week'} 
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </TimeButton>
          <TimeButton 
            $active={timeRange === 'month'} 
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </TimeButton>
          <TimeButton 
            $active={timeRange === 'year'} 
            onClick={() => setTimeRange('year')}
          >
            Last 12 Months
          </TimeButton>
          <TimeButton 
            $active={timeRange === 'all'} 
            onClick={() => setTimeRange('all')}
          >
            All Time
          </TimeButton>
        </TimeRangeSelector>
      </PageHeader>
      
      {/* Stat Cards */}
      <StatCard>
        <StatHeader>
          <StatTitle>
            <Clock size={16} />
            Listening Time
          </StatTitle>
        </StatHeader>
        <StatValue>142h</StatValue>
        <StatChange $positive={true}>+12% from last month</StatChange>
      </StatCard>
      
      <StatCard>
        <StatHeader>
          <StatTitle>
            <Music size={16} />
            Tracks Played
          </StatTitle>
        </StatHeader>
        <StatValue>1,872</StatValue>
        <StatChange $positive={true}>+245 from last month</StatChange>
      </StatCard>
      
      <StatCard>
        <StatHeader>
          <StatTitle>
            <Disc size={16} />
            Albums Explored
          </StatTitle>
        </StatHeader>
        <StatValue>87</StatValue>
        <StatChange $positive={false}>-3 from last month</StatChange>
      </StatCard>
      
      <StatCard>
        <StatHeader>
          <StatTitle>
            <Headphones size={16} />
            Avg. Daily Time
          </StatTitle>
        </StatHeader>
        <StatValue>4.7h</StatValue>
        <StatChange $positive={true}>+0.5h from last month</StatChange>
      </StatCard>
      
      {/* Charts */}
      <Panel title="LISTENING ACTIVITY" fullHeight style={{ gridColumn: '1 / span 2' }}>
        <ChartContainer>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <div style={{ fontSize: '14px', color: 'var(--textSecondary)', marginBottom: 'var(--spacing-xs)' }}>
              Hours listened per day
            </div>
          </div>
          
          <LineChartViz>
            <LineChartPath $path="polygon(
              0% 100%, 
              0% 50%, 
              10% 45%, 
              20% 60%, 
              30% 40%, 
              40% 30%, 
              50% 20%, 
              60% 35%, 
              70% 25%, 
              80% 20%, 
              90% 30%, 
              100% 10%, 
              100% 100%
            )" />
          </LineChartViz>
          
          <ChartLabels>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <ChartLabel key={day}>{day}</ChartLabel>
            ))}
          </ChartLabels>
        </ChartContainer>
      </Panel>
      
      <Panel title="GENRE BREAKDOWN" fullHeight style={{ gridColumn: '3 / span 2' }}>
        <ChartContainer>
          <PieChartViz>
            <PieChartSlice $value1="35" $value2="65" $value3="85" />
          </PieChartViz>
          
          <PieLegend>
            <LegendItem>
              <LegendColor $color="var(--accentPrimary)" />
              Electronic (35%)
            </LegendItem>
            <LegendItem>
              <LegendColor $color="var(--accentHighlight)" />
              Rock (30%)
            </LegendItem>
            <LegendItem>
              <LegendColor $color="var(--accentWarning)" />
              Jazz (20%)
            </LegendItem>
            <LegendItem>
              <LegendColor $color="var(--accentError)" />
              Other (15%)
            </LegendItem>
          </PieLegend>
        </ChartContainer>
      </Panel>
      
      <Panel title="TOP ARTISTS" fullHeight style={{ gridColumn: '1 / span 2' }}>
        <TableHead>
          <span>#</span>
          <span>ARTIST</span>
          <span>PLAYS</span>
        </TableHead>
        
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRow key={i}>
            <RankNumber>{i + 1}</RankNumber>
            <ItemInfo>
              <ItemName>Artist Name {i + 1}</ItemName>
            </ItemInfo>
            <ItemStat>{120 - (i * 12)}</ItemStat>
          </TableRow>
        ))}
      </Panel>
      
      <Panel title="TOP TRACKS" fullHeight style={{ gridColumn: '3 / span 2' }}>
        <TableHead>
          <span>#</span>
          <span>TRACK</span>
          <span>PLAYS</span>
        </TableHead>
        
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRow key={i}>
            <RankNumber>{i + 1}</RankNumber>
            <ItemInfo>
              <ItemName>Track Name {i + 1}</ItemName>
              <ItemSubtitle>Artist Name</ItemSubtitle>
            </ItemInfo>
            <ItemStat>{85 - (i * 8)}</ItemStat>
          </TableRow>
        ))}
      </Panel>
    </PageContainer>
  );
};

export default AnalyticsPage;