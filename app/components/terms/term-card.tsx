import { Link } from "@remix-run/react";

import { customDate } from "~/utils/helpers";
import { Card } from "../utilities/card";
import { Paragraph, SubTitle, Title } from "../utilities/Typography";
import { Box } from "../utilities/layout";
import { useActionsOption } from "../utilities/actions-option/context";
import { ActionsOption } from "./action-option";
import { descriptionClasses, headerClasses } from "../sets/styled";

import type { TTerm } from "~/types/endpoints";

export const TermCard = ({ term }: { term: TTerm }) => {
  const {
    state: { isBinned },
  } = useActionsOption();

  return (
    <Card isbinned={isBinned ? isBinned.toString() : undefined}>
      <ActionsOption term={term} />
      <Link to={`terms/${term.id}`}>
        {/* <Link prefetch="intent" to={`terms/${term.id}`}> */}
        <Box classes={headerClasses}>
          <Title>{term.name}</Title>
          <SubTitle>Latest update: {customDate(term.updatedAt)}</SubTitle>
        </Box>
        <Box classes={descriptionClasses}>
          <Paragraph>{term.definition}</Paragraph>
        </Box>
      </Link>
    </Card>
  );
};
