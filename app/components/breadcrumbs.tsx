import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Fragment } from "react";
import { useLocation } from "@remix-run/react";

interface BreadcrumbsProps {
  replace?: { [key: string]: string };
  exclude?: string[];
}

export function Breadcrumbs({ replace, exclude }: BreadcrumbsProps) {
  const { pathname } = useLocation();
  const crumbs = pathname.split("/").filter((crumb) => crumb !== "");

  const renderCrumbs = (crumbs: string[]) => {
    const isLast = (index: number) => index === crumbs.length - 1;
    return crumbs.map((crumb, index) => {
      if (exclude && exclude.includes(crumb)) {
        return null;
      }

      let crumbText = replace?.[crumb] ?? crumb;
      crumbText = crumbText.charAt(0).toUpperCase() + crumbText.slice(1);
      const crumbHref = `/${crumbs.slice(0, index + 1).join("/")}`;

      return (
        <Fragment key={crumb}>
          <BreadcrumbItem>
            {isLast(index) ? (
              <BreadcrumbPage>{crumbText}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={crumbHref}>{crumbText}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isLast(index) && <BreadcrumbSeparator />}
        </Fragment>
      );
    });
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {renderCrumbs(crumbs)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
