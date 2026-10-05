import {
  ClosingLoop,
  ColdOpenHero,
  EmotionalCenter,
  VisitProgress,
  VitalsChapters,
} from "@/components/VitalsStory";
import { AnimalPresence } from "@/components/animals/AnimalPresence";
import { CalmCursor } from "@/components/CalmCursor";
import { CareChart } from "@/components/CareChart";
import { EcgLine } from "@/components/EcgLine";
import { EmergencyBar } from "@/components/EmergencyBar";
import { Emergency, Footer, Location } from "@/components/Closing";
import { EntranceExperience } from "@/components/EntranceExperience";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Team } from "@/components/TeamStories";
import { VitalsShell } from "@/components/VitalsShell";
import { WhenToVisit } from "@/components/WhenToVisit";

export default function HomePage() {
  return (
    <EntranceExperience>
      <VitalsShell>
        <EmergencyBar />
        <EcgLine />
        <VisitProgress />
        <GrainOverlay />
        <CalmCursor />
        <AnimalPresence />
        <main>
          <ColdOpenHero />
          <VitalsChapters />
          <EmotionalCenter />
          <CareChart />
          <WhenToVisit />
          <Team />
          <Emergency />
          <Location />
          <ClosingLoop />
          <Footer />
        </main>
      </VitalsShell>
    </EntranceExperience>
  );
}
