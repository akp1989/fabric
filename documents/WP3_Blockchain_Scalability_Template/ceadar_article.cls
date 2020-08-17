%%
%% Copyright (C) 2011 by Michele Lombardi
%% Extended by Barry O'Sullivan (2013), Oisin Boydell (2013)
%%
%% This file may be distributed and/or modified under the
%% conditions of the LaTeX Project Public License, either
%% version 1.2 of this license or (at your option) any later
%% version. The latest version of this license is in:
%%
%% http://www.latex-project.org/lppl.txt
%%
%% and version 1.2 or later is part of all distributions of
%% LaTeX version 1999/12/01 or later.
%%

%% -----------------------------------------------------------------------------
%% Identification
%%

\NeedsTeXFormat{LaTeX2e}[2009/01/01]
\ProvidesClass{ceadar_article}[2013/05/04 CeADAR Project Report (no chapters)]

%% -----------------------------------------------------------------------------
%% Required packages (needed for the option code)
%%

% The "ifthen" package is used to handle options
\RequirePackage{ifthen}

% Graphics package (loaded here to avoid interference with the "draft" option)
\RequirePackage[pdftex]{graphicx}

\RequirePackage{fancyhdr}
\RequirePackage{hyperref}

%% -----------------------------------------------------------------------------
%% Options
%%

% disable unusedor forced "article" options
\DeclareOption{twocolumn}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports single column layout}}

% disable unsupported paper sizes
\DeclareOption{letterpaper}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports A4 paper}}
\DeclareOption{a5paper}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports A4 paper}}
\DeclareOption{b5paper}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports A4 paper}}
\DeclareOption{legalpaper}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports A4 paper}}
\DeclareOption{executivepaper}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports A4 paper}}
\DeclareOption{landscape}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports A4 paper}}

% Disable font size other than 12 pt
\DeclareOption{11pt}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports 12pt font}}
\DeclareOption{10pt}{\OptionNotUsed\PackageWarning{ceadar_article}{%
Ignoring `\CurrentOption': this package only supports 12pt font}}

% twoside layout is handled by the current package
\DeclareOption{twoside}{\OptionNotUsed}

% the draft mode is handled by this class and is not forwarded to article
\newboolean{comments} % this needs the ifthen package
\DeclareOption{epoldraft}{\setboolean{comments}{true}}

% Pass unknown options to the base class
\DeclareOption*{%
\PassOptionsToClass{\CurrentOption}{article}%
}

% execute option code
\ProcessOptions\relax

%% -----------------------------------------------------------------------------
%% Load base class
%%
\let\maketitle\relax

\LoadClass[a4paper,12pt]{article}

%% -----------------------------------------------------------------------------
%% Required packages
%%


% Use colors
\RequirePackage{color}

% spacing between paragraph, but not between list items
\RequirePackage{parskip}

% better headers
\RequirePackage{fancyhdr} % consider getting rid of this

% Palatino-like font
% If you are using TeXLive, you need the tex-gyre package for this
\RequirePackage[T1]{fontenc}
\RequirePackage{tgpagella}

% Titlesec package, to customize section fonts
\RequirePackage{titlesec}

%% -----------------------------------------------------------------------------
%% Define margins
%%

% Commands to be executed at the beginning of the document
\AtBeginDocument{
%  \thesecondpage
%  \clearpage
%  \tableofcontents
%  \clearpage
}

% Commands to be executed at the end
\AtEndDocument{
  \label{maxpage} % to find out the number of pages
}


%% -----------------------------------------------------------------------------
%% Define margins
%%

% BOS
% alter margins
% compute textwidth
\setlength{\textwidth}{0.80952381\paperwidth}

% set left/right margins
\setlength{\@tempdima}{\paperwidth}
\addtolength{\@tempdima}{-\textwidth}
\setlength{\oddsidemargin}{.5\@tempdima}
\addtolength{\oddsidemargin}{-1in}


% Change margins if comments option used
\ifthenelse{\boolean{comments}}{
 	\addtolength{\oddsidemargin}{-1.5cm}
	\addtolength{\marginparwidth}{1.5cm}
}{}

% compute text height
\setlength{\textheight}{0.84\paperheight}

% compute header parameters
\setlength{\headheight}{0.1cm} % fixed head height (due to fixed font size)
\setlength{\@tempdima}{\paperheight}
\addtolength{\@tempdima}{-\textheight}
\addtolength{\@tempdima}{-0.2cm} % subtract header and foot height
\setlength{\headsep}{0.265116279\@tempdima}

% compute footer parameters
\setlength{\footskip}{0.1cm} % to account for the fixed foot size
\addtolength{\footskip}{0.153488372\@tempdima}

% compute top margins as in the article class
\setlength{\topmargin}{\paperheight}
\addtolength{\topmargin}{-2in}
\addtolength{\topmargin}{-\headheight}
\addtolength{\topmargin}{-\headsep}
\addtolength{\topmargin}{-\textheight}
\addtolength{\topmargin}{-\footskip}% this might be wrong
\addtolength{\topmargin}{-.5\topmargin}

%% -----------------------------------------------------------------------------
%% Customize headings
%%

% Add a "draft" label in case the draft mode il enabled
\ifthenelse{\boolean{comments}}{% add "draft" mark
\pagestyle{fancy} % enable headings formatting
\fancyhf{} % clear defaults
\fancyhead[C]{-- DRAFT --}%
\fancyfoot[C] {\thepage}
}

%% -----------------------------------------------------------------------------
%% Default font and paragraph style
%%

% Fix the standard text size & spacing
\renewcommand{\normalsize}{\fontsize{12pt}{16pt}\selectfont}

% paragraph spacing
%\setlength{\parskip}{1ex plus 0.5ex minus 0.2ex}

% remove paragraph indentation
\setlength{\parindent}{0pt}

%% -----------------------------------------------------------------------------
%% Customized lists
%%

% this reduces the space between the items and before/after the list: extra
% space between the list and surrounding paragraphs is added by the parskip
% package
\def\@listi{\leftmargin\leftmargini
\parsep 0\p@ \@plus2\p@ \@minus\p@
\topsep -6\p@ \@plus2\p@ \@minus4\p@
\itemsep0\p@ \@plus2\p@ \@minus\p@}

%% -----------------------------------------------------------------------------
%% Customized titles
%%

%\titleformat{\section}{\bf\fontsize{16pt}{16pt}\selectfont}%
%{\thesection.}{.85cm}{}
\titleformat*{\section}{\bf\fontsize{16pt}{16pt}\selectfont}
\titlespacing*{\section}{0pt}{16pt}{4pt}

%\titleformat{\subsection}{\bf\fontsize{15pt}{15pt}\selectfont}%
%{\thesubsection.}{.53cm}{}
\titleformat*{\subsection}{\bf\fontsize{15pt}{15pt}\selectfont}
\titlespacing*{\subsection}{0pt}{16pt}{4pt}

%\titleformat{\subsubsection}{\bf\fontsize{14pt}{14pt}\selectfont}%
%{\thesubsubsection.}{.26cm}{}
\titleformat*{\subsubsection}{\bf\fontsize{14pt}{14pt}\selectfont}
\titlespacing*{\subsubsection}{0pt}{16pt}{4pt}

%% -----------------------------------------------------------------------------
%% Blank page command
%%

\newcommand{\blankpage}{\begin{center}\vspace*{5cm}%
This page has been intentionally left blank.%
\newpage\end{center}}


% Use British format for output of \today
\edef\today{\number\day\space
\ifcase\month\or
January\or February\or March\or April\or May\or June\or July\or 
August\or September\or October\or November\or December\fi\ \number\year} 

%% -----------------------------------------------------------------------------
%% Command to support the construction of the title page
%%

% Move title value to a custom command
\renewcommand{\title}[1]{\renewcommand{\thetitle}{#1}}
\newcommand{\thetitle}{Title}

% Move abstract to a custom command
\renewcommand{\abstract}[1]{\renewcommand{\theabstract}{#1}}
\newcommand{\theabstract}{?}


% Command for the document type
\newcommand{\doctype}[1]{\renewcommand{\thedoctype}{#1}}
\newcommand{\thedoctype}{?}

% Command for the project title
\newcommand{\projecttitle}[1]{\renewcommand{\theprojecttitle}{#1}}
\newcommand{\theprojecttitle}{?}

% Command for the document type
\newcommand{\dissemination}[1]{\renewcommand{\thedissemination}{#1}}
\newcommand{\thedissemination}{?}

% Command for the editor
\newcommand{\themeleader}[1]{\renewcommand{\thethemeleader}{#1}}
\newcommand{\thethemeleader}{?}

% Command for the editor
\newcommand{\editor}[1]{\renewcommand{\theeditor}{#1}}
\newcommand{\theeditor}{?}

% Command for the document state
\newcommand{\docstate}[1]{\renewcommand{\thedocstate}{#1}}
\newcommand{\thedocstate}{?}

% Command for the document version
\newcommand{\docversion}[1]{\renewcommand{\thedocversion}{#1}}
\newcommand{\thedocversion}{?}

% Command for the contributing partners
\newcommand{\partners}[1]{\renewcommand{\thepartners}{#1}}
\newcommand{\thepartners}{?}

% Command for the contributing WPS
\newcommand{\workpackage}[1]{\renewcommand{\theworkpackage}{#1}}
\newcommand{\theworkpackage}{?}

% Command for the contributing WPS
\newcommand{\subtheme}[1]{\renewcommand{\thesubtheme}{#1}}
\newcommand{\thesubtheme}{?}

% Command for the estimated person months
\newcommand{\estimatedpm}[1]{\renewcommand{\theestimatedpm}{#1}}
\newcommand{\theestimatedpm}{?}

% Command for the date of completion
\newcommand{\completiondate}[1]{\renewcommand{\thecompletiondate}{#1}}
\newcommand{\thecompletiondate}{?}

% Command for the date of delivery
\newcommand{\deliverydate}[1]{\renewcommand{\thedeliverydate}{#1}}
\newcommand{\thedeliverydate}{?}

% Define author(s)
\renewcommand{\author}[1]{\renewcommand{\theauthor}{#1}}
\newcommand{\theauthor}{?}

% Define author's address
\newcommand{\address}[1]{\renewcommand{\theaddress}{#1}}
\newcommand{\theaddress}{?}


%% -----------------------------------------------------------------------------
%% The actual \maketitle command
%%


\renewcommand{\maketitle}{
\thispagestyle{empty}

% This is the top banner
%{\rule{\textwidth}{1.5pt}}
\begin{center}
\setlength{\parskip}{0pt}
\includegraphics[width=6cm]{CeADARLogoL.jpg}\\[1em]
{\fontsize{15pt}{13pt}\selectfont CeADAR - The National Centre for Applied Data Analytics and Machine Intelligence}\\[1em]
\end{center}

{\rule{\textwidth}{1.5pt}}

\vspace{8mm}

% The document title
\begin{center}
\fontsize{24pt}{24pt}\selectfont \thetitle
\end{center}

\vspace{1cm}

% The facts table
\begin{center}
\begin{tabular}{@{}p{0.45\textwidth}@{}p{0.45\textwidth}@{}}\hline
\ifthenelse{\equal{\thedoctype}{?}}{}{%
Document Type:					& \thedoctype \\%
}
\ifthenelse{\equal{\thedissemination}{?}}{}{%
Dissemination Level:			& \thedissemination \\%
}
\ifthenelse{\equal{\theprojecttitle}{?}}{}{%
Project Title:					& \theprojecttitle \\%
}
\ifthenelse{\equal{\theworkpackage}{?}}{}{%
Work Package:				& \theworkpackage\\%
}
\ifthenelse{\equal{\thethemeleader}{?}}{}{%
Theme Leader:							& \thethemeleader\\%
}
\ifthenelse{\equal{\thesubtheme}{?}}{}{%
DDN Sub-Theme:				& \thesubtheme\\%
}
\ifthenelse{\equal{\theauthor}{?}}{}{%
Authors:					& \theauthor \\%
}
\ifthenelse{\equal{\theeditor}{?}}{}{%
Editor:							& \theeditor\\%
}
\ifthenelse{\equal{\thepartners}{?}}{}{%
Industry  Partners:			& \thepartners\\%
}
\ifthenelse{\equal{\thedocversion}{?}}{}{%
Document Version:				& \thedocversion\\%
}
\ifthenelse{\equal{\theestimatedpm}{?}}{}{%
Estimated P/M (if applicable):	& \theestimatedpm\\%
}
\ifthenelse{\equal{\thecompletiondate}{?}}{}{%
Date of Completion:				& \thecompletiondate\\%
}
\ifthenelse{\equal{\thedeliverydate}{?}}{}{%
Date:			& \thedeliverydate\\%
}
Number of pages:				& \pageref{maxpage}\\\hline
\end{tabular}
\end{center}

\vspace{1cm}


\ifthenelse{\equal{\theabstract}{?}}{}{%
\begin{small}
{\bf ABSTRACT}\\
\theabstract
\end{small}
}

\vfill

\begin{scriptsize}
Copyright \textcopyright \ the authors. Confidential -- not to be circulated without permission.\\
CeADAR is a research partnerhip comprising
University College Dublin
 and
the Technical University of Dublin.\\
\url{http://www.ceadar.ie}
\end{scriptsize}

\newpage

\tableofcontents

\newpage

}

%% -----------------------------------------------------------------------------
%% Comments and revisions
%%

\ifthenelse{\boolean{comments}}{%
\newcommand{\MCMT}[2]{\marginpar{\color{red}\footnotesize\raggedleft\it #1: #2}}%
}{\newcommand{\MCMT}[2]{}}

\ifthenelse{\boolean{comments}}{%
\newcommand{\ICMT}[2]{{\color{black}\bf\{#1: #2\}}}%
}{\newcommand{\ICMT}[2]{}}
