import { json, redirect } from "@remix-run/node";
import { useCatch } from "@remix-run/react";

import { getAuthSession } from "~/utils/auth.server";
import { fetchSetTerms } from "~/endpoints/query/terms";
import { TermsLayout } from "~/components/terms";
import { validateTitle } from "~/utils/helpers";
import { editTerm, moveTerm } from "~/endpoints/mutation/term";
import { fetchSetLevels } from "~/endpoints/query/levels";
import { ErrorMessageField } from "~/components/utilities/inputs";

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { TermActionData, TermsLoaderData } from "~/types/data";

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const authSession = await getAuthSession(request);
    const token = authSession.getToken();
    if (!token) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const skip = url.searchParams.get("skip");
    const take = url.searchParams.get("take");
    const search = url.searchParams.get("search");

    const pageToken = 12;

    const { setId } = params;

    if (typeof setId !== "string") return { error: "Set ID must be defined" };

    const fetchSetTermsResponse = await fetchSetTerms(
      {
        setId,
        skip: skip ? parseInt(skip) : 0,
        take: take ? parseInt(take) : pageToken,
        search,
      },
      token
    );

    const fetchLevelsResponse = await fetchSetLevels(
      {
        setId,
      },
      token
    );

    const { items, ...paginationData } = fetchSetTermsResponse.data.setTerms;

    const data: TermsLoaderData = {
      terms: items,
      levels: fetchLevelsResponse.data.setLevels.levels,
      ...paginationData,
      take: take ? parseInt(take) : pageToken,
      skip: skip ? parseInt(skip) : 0,
    };

    return json(data);
  } catch (error: any) {
    throw new Response(error.message, { status: 500 });
  }
};

export const badRequest = (data: TermActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
  const authSession = await getAuthSession(request);
  const token = authSession.getToken();
  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { setId } = params;

  const form = await request.formData();
  const id = form.get("id");
  const name = form.get("name");
  const levelId = form.get("levelId");
  const definition = form.get("definition");
  const actionType = form.get("actionType");

  if (typeof id !== "string" || typeof actionType !== "string") {
    return badRequest({
      formError: `Form not submitted correctly. both (ID & actionType) must be provided`,
    });
  }

  try {
    switch (actionType) {
      case "edit": {
        if (typeof name !== "string" || typeof definition !== "string") {
          return badRequest({
            formError: `Form not submitted correctly.`,
          });
        }

        const fieldErrors = {
          name: validateTitle(name),
        };
        const fields = { name };

        if (Object.values(fieldErrors).some(Boolean))
          return badRequest({ fieldErrors, fields });
        const responseEditTerm = await editTerm(
          { id, name, definition },
          token
        );

        const termLevelId = responseEditTerm.data.updateTerm.term.levelId;
        return redirect(`/set/${setId}/levels/${termLevelId}`);
      }
      case "move": {
        if (typeof levelId !== "string") {
          return badRequest({
            formError: `Form not submitted correctly.`,
          });
        }

        const fieldErrors = {
          levelId: validateTitle(levelId),
        };
        const fields = { levelId };

        if (Object.values(fieldErrors).some(Boolean))
          return badRequest({ fieldErrors, fields });

        await moveTerm({ id, levelId }, token);
        return redirect(`/set/${setId}/levels/${levelId}`);
      }
      default: {
        return badRequest({
          formError: `Action type invalid`,
        });
      }
    }
  } catch (error: any) {
    return badRequest({
      formError: error.message,
    });
  }
};

export default function Levels() {
  return <TermsLayout />;
}

export function CatchBoundary() {
  const caught = useCatch();

  return <ErrorMessageField>{caught.statusText}</ErrorMessageField>;
}
