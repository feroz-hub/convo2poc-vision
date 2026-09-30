import {
  ConversationNode,
  AIHubNode,
  RequirementCluster,
  ClarificationNode,
  ScopeNode,
  PrototypeNode,
  ValidationNode,
  FeedbackLoop,
} from './ConceptFlowNodes';
import { SignalPath } from './SignalPath';
export function ConceptFlowVisual() {
  return (
    <div
      className="concept-visual"
      role="img"
      aria-label="Conversation flows through AI intelligence, requirements, clarification, human-approved scope, prototype and validation. Reviewed feedback loops through human approval to POC v2. Illustrative concept animation, not live demo results."
    >
      <div className="concept-caption">
        CONVERSATION → WORKING PROOF <span>ILLUSTRATIVE STORY</span>
      </div>
      <div aria-hidden="true" className="concept-story">
        <SignalPath />
        <ConversationNode />
        <AIHubNode />
        <RequirementCluster />
        <ClarificationNode />
        <ScopeNode />
        <PrototypeNode />
        <ValidationNode />
        <FeedbackLoop />
      </div>
    </div>
  );
}
