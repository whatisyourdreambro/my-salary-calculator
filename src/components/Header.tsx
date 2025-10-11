"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { LayoutDashboard, Menu } from "lucide-react";

const calculators = [
  { title: "종합 계산기 (정규직)", href: "/?tab=salary", description: "4대보험, 소득세를 포함한 월 실수령액을 계산합니다." },
  { title: "퇴직금 계산기", href: "/?tab=severance", description: "예상 퇴직금을 미리 계산하고 절세 전략을 확인하세요." },
  { title: "알바/프리랜서", href: "/?tab=freelancer", description: "3.3% 및 4대보험 적용 시 실수령액을 계산합니다." },
  { title: "환율 영향 계산기", href: "/?tab=exchange", description: "환율 변동이 내 자산에 미치는 영향을 분석합니다." },
  { title: "연말정산 계산기", href: "/year-end-tax", description: "최적의 환급 시나리오를 시뮬레이션합니다." },
  { title: "미래 연봉 예측", href: "/?tab=future", description: "이직, 승진에 따른 미래 연봉 변화를 예측합니다." },
];

const tables = [
  { title: "연봉 표", href: "/table/annual", description: "연봉별 실수령액을 한눈에 확인하세요." },
  { title: "월급 표", href: "/table/monthly", description: "월급별 실수령액을 한눈에 확인하세요." },
  { title: "주급 표", href: "/table/weekly", description: "주급별 실수령액을 한눈에 확인하세요." },
  { title: "시급 표", href: "/table/hourly", description: "시급별 실수령액을 한눈에 확인하세요." },
];

const contents = [
  { title: "전체 가이드", href: "/guides", description: "연봉, 세금, 재테크에 대한 모든 지식을 얻으세요." },
  { title: "자주 묻는 질문(Q&A)", href: "/qna", description: "궁금했던 모든 질문에 대한 답변을 찾아보세요." },
  { title: "용어 사전", href: "/glossary", description: "어려운 금융 용어를 쉽게 풀이합니다." },
  { title: "🍀 행운의 로또 번호", href: "/lotto", description: "재미로 보는 행운의 로또 번호 생성기." },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <h1 className="font-bold text-primary">Moneysalary</h1>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>계산기</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {calculators.map((component) => (
                      <ListItem key={component.title} title={component.title} href={component.href}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>연봉 테이블</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                    {tables.map((component) => (
                      <ListItem key={component.title} title={component.title} href={component.href}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>콘텐츠</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                    {contents.map((component) => (
                      <ListItem key={component.title} title={component.title} href={component.href}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Header */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:hidden">
            <Link href="/" className="flex items-center space-x-2">
                <h1 className="font-bold text-primary">Moneysalary</h1>
            </Link>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>메뉴</SheetTitle>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        {[...calculators, ...tables, ...contents].map((item) => (
                            <Link key={item.href} href={item.href} className="-m-3 block rounded-md p-3 text-base font-medium hover:bg-accent">
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link href="/dashboard" passHref>
                <Button variant="ghost">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">마이 대시보드</span>
                </Button>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";