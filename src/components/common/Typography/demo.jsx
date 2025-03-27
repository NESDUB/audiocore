import React from 'react';
import styled from 'styled-components';
import Typography, { 
  DisplayText, 
  HeadingText, 
  LabelText, 
  BodyText, 
  TechText,
  SectionTitle,
  StatusText
} from './index';

// Demo container
const DemoContainer = styled.div`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 6px;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const Row = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 4px;
  padding: 16px;
`;

// Demo component
const TypographyDemo = () => {
  return (
    <DemoContainer>
      <Section>
        <SectionTitle>Typography System Overview</SectionTitle>
        <BodyText>
          This is a demonstration of the Typography components for AudioCore, following the 
          AudiophileConsole design language. The system provides consistent typography across
          the application with support for various text styles and customization options.
        </BodyText>
      </Section>
      
      <Section>
        <SectionTitle>Display & Headings</SectionTitle>
        <Row>
          <DisplayText variant="display1">Display 1</DisplayText>
        </Row>
        <Row>
          <DisplayText variant="display2">Display 2</DisplayText>
        </Row>
        <Row>
          <DisplayText variant="display3">Display 3</DisplayText>
        </Row>
        <Row>
          <HeadingText variant="h1">Heading 1</HeadingText>
        </Row>
        <Row>
          <HeadingText variant="h2">Heading 2</HeadingText>
        </Row>
        <Row>
          <HeadingText variant="h3">Heading 3</HeadingText>
        </Row>
        <Row>
          <HeadingText variant="h4">Heading 4</HeadingText>
        </Row>
        <Row>
          <HeadingText variant="h5">Heading 5</HeadingText>
        </Row>
        <Row>
          <HeadingText variant="h6">Heading 6</HeadingText>
        </Row>
      </Section>
      
      <Section>
        <SectionTitle>Body Text</SectionTitle>
        <Row>
          <BodyText variant="body1">
            Body 1 - This is the standard body text used for most content areas. The text is 
            clearly legible even at smaller sizes, maintaining the sleek aesthetic of the 
            AudiophileConsole design language. The line height is optimized for readability.
          </BodyText>
        </Row>
        <Row>
          <BodyText variant="body2">
            Body 2 - A smaller variant of the body text, used for secondary information and 
            when space is limited. It maintains readability while allowing for more compact 
            layouts.
          </BodyText>
        </Row>
        <Row>
          <BodyText variant="caption">
            Caption - Used for tertiary information, captions, and supplementary details.
            Typically displayed in a lighter color to create visual hierarchy.
          </BodyText>
        </Row>
      </Section>
      
      <Section>
        <SectionTitle>Labels & Technical Text</SectionTitle>
        <Grid>
          <Card>
            <LabelText>LABEL TEXT</LabelText>
            <BodyText variant="body2">
              Used for form labels, section titles, and other categorical information.
            </BodyText>
          </Card>
          <Card>
            <LabelText>TIME CODE</LabelText>
            <TechText>03:42.15</TechText>
          </Card>
          <Card>
            <LabelText>SAMPLE RATE</LabelText>
            <TechText>48kHz / 24bit</TechText>
          </Card>
          <Card>
            <LabelText>BUFFER SIZE</LabelText>
            <TechText>512 samples</TechText>
          </Card>
        </Grid>
      </Section>
      
      <Section>
        <SectionTitle>Section Titles</SectionTitle>
        <Row>
          <SectionTitle>DEFAULT SECTION TITLE</SectionTitle>
          <BodyText variant="body2">Standard section title with left-aligned underline.</BodyText>
        </Row>
        <Row>
          <SectionTitle centered>CENTERED SECTION TITLE</SectionTitle>
          <BodyText variant="body2" center>Centered title with centered underline and text.</BodyText>
        </Row>
        <Row>
          <SectionTitle underlineColor="#91F291">COLORED UNDERLINE</SectionTitle>
          <BodyText variant="body2">Section title with custom underline color.</BodyText>
        </Row>
      </Section>
      
      <Section>
        <SectionTitle>Status Indicators</SectionTitle>
        <Grid>
          <Card>
            <StatusText status="success" withDot>ENGINE ACTIVE</StatusText>
          </Card>
          <Card>
            <StatusText status="error" withDot>CONNECTION LOST</StatusText>
          </Card>
          <Card>
            <StatusText status="warning" withDot>LOW MEMORY</StatusText>
          </Card>
          <Card>
            <StatusText status="info" withDot>BUFFERING</StatusText>
          </Card>
        </Grid>
      </Section>
      
      <Section>
        <SectionTitle>Typography Customization</SectionTitle>
        <Grid>
          <Card>
            <Typography 
              variant="body1" 
              uppercase 
              spacing={2}
              weight="bold"
            >
              Custom Text
            </Typography>
          </Card>
          <Card>
            <Typography 
              variant="body1" 
              noWrap
              color="#91F291"
            >
              This text will not wrap and will be truncated if it's too long for the container
            </Typography>
          </Card>
          <Card>
            <Typography 
              variant="body1" 
              truncate={2}
              lineHeight={1.2}
            >
              This text will be truncated after 2 lines with an ellipsis. Lorem ipsum dolor sit amet, 
              consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </Card>
          <Card>
            <Typography 
              variant="body1" 
              monospace
              transform="lowercase"
            >
              CUSTOM MONOSPACE TEXT
            </Typography>
          </Card>
        </Grid>
      </Section>
    </DemoContainer>
  );
};

export default TypographyDemo;