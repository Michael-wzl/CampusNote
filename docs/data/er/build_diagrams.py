"""Rebuild the editable Chen SVG handoff views using Python's standard library."""

from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent


class Diagram:
    def __init__(self, title, subtitle, height=1160):
        self.title, self.subtitle, self.height = title, subtitle, height
        self.edges, self.nodes = [], []

    def text(self, x, y, value, size=24, anchor="middle", bold=False):
        self.nodes.append(
            f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}"'
            f' font-weight="{600 if bold else 400}">{escape(value)}</text>'
        )

    def edge(self, points, total=False, arrow=False):
        suffix = ' marker-end="url(#one)"' if arrow else ""
        if total:
            # The one orthogonal bend uses a matching three-pixel miter offset.
            dx = 3 if len(points) > 2 or points[0][0] == points[1][0] else 0
            dy = 3 if len(points) > 2 or dx == 0 else 0
            for sign in [-1, 1]:
                ps = " ".join(f"{x+sign*dx},{y+sign*dy}" for x, y in points)
                self.edges.append(f'<polyline points="{ps}"{suffix}/>')
        else:
            ps = " ".join(f"{x},{y}" for x, y in points)
            self.edges.append(f'<polyline points="{ps}"{suffix}/>')

    def entity(self, x, y, name, weak=False):
        self.nodes.append(f'<rect x="{x-95}" y="{y-35}" width="190" height="70"/>')
        if weak:
            self.nodes.append(f'<rect x="{x-89}" y="{y-29}" width="178" height="58"/>')
        self.text(x, y+8, name, bold=True)

    def relationship(self, x, y, name, weak=False):
        self.nodes.append(f'<polygon points="{x-85},{y} {x},{y-45} {x+85},{y} {x},{y+45}"/>')
        if weak:
            self.nodes.append(f'<polygon points="{x-75},{y} {x},{y-38} {x+75},{y} {x},{y+38}"/>')
        self.text(x, y+7, name, size=21)

    def attribute(self, x, y, name, key=False, partial=False, multi=False, derived=False, rx=105):
        dash = ' stroke-dasharray="9 6"' if derived else ""
        self.nodes.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="31"{dash}/>')
        if multi:
            self.nodes.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx-6}" ry="25"/>')
        self.text(x, y+7, name, size=21)
        if key or partial:
            width = min(rx*1.6, len(name)*11)
            dash = ' stroke-dasharray="5 4"' if partial else ""
            self.nodes.append(f'<path d="M {x-width/2} {y+12} h {width}" fill="none"{dash}/>')

    def save(self, name, note):
        self.text(45, 57, self.title, size=32, anchor="start", bold=True)
        self.text(45, 92, self.subtitle, size=20, anchor="start")
        y = self.height-105
        self.nodes.append(f'<path d="M 45 {y} H 1755"/>')
        self.text(45, y+32, "Chen notation: rectangle = entity; diamond = relationship; ellipse = attribute; underline = key.", size=19, anchor="start")
        self.text(45, y+61, "Arrow at entity = at most one; double line = total participation; double rectangle/diamond = weak identification.", size=19, anchor="start")
        self.text(45, y+88, note, size=18, anchor="start")
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="{self.height}" viewBox="0 0 1800 {self.height}" role="img">'
            f'<title>{escape(self.title)}</title><desc>{escape(self.subtitle + " " + note)}</desc>'
            '<defs><marker id="one" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">'
            '<path d="M 1 1 L 10 6 L 1 11" fill="none" stroke="#202020" stroke-width="2.4"/></marker></defs>'
            '<rect width="100%" height="100%" fill="white"/>'
            '<g fill="none" stroke="#202020" stroke-width="2.4" stroke-linejoin="round">'
            + "".join(self.edges) + '</g><g font-family="Arial, Helvetica, sans-serif" fill="white" stroke="#202020" stroke-width="2.4">'
            + "".join(node if not node.startswith('<text') else node.replace('<text ', '<text stroke="none" fill="#202020" ') for node in self.nodes)
            + '</g></svg>'
        )
        ET.fromstring(svg)
        (ROOT/name).write_text(svg, encoding="utf-8")
        print(name)


# View 1: the two post identities (author and per-post commenter) remain separate.
d = Diagram("Forum and per-post identities", "Selected conceptual model: authorship, aliases, comments, topics and ordered images.")
d.entity(800, 170, "user")
d.entity(800, 590, "post")
d.entity(250, 590, "post_image", weak=True)
d.entity(1350, 590, "comment")
d.entity(800, 920, "topic")
for x, y, name, rx in [(1040,170,"user_id",105),(1030,740,"post_id",105),(250,740,"position",105),(1350,760,"comment_id",115),(1040,920,"topic_id",105)]:
    d.attribute(x,y,name,key=name!="position",partial=name=="position",rx=rx)
d.edge([(895,170),(935,170)])
d.edge([(895,615),(970,714)])
d.edge([(250,625),(250,709)])
d.edge([(1350,625),(1350,729)])
d.edge([(895,920),(935,920)])
d.relationship(800,350,"writes")
d.edge([(800,305),(800,205)],arrow=True)
d.edge([(800,555),(800,395)],total=True)
d.relationship(500,350,"participates")
d.edge([(705,170),(500,305)])
d.edge([(730,555),(500,395)])
d.attribute(260,285,"alias_no")
d.attribute(260,405,"joined_at")
d.edge([(365,285),(415,350)])
d.edge([(365,405),(415,350)])
d.relationship(475,590,"has image",weak=True)
d.edge([(345,590),(390,590)],total=True)
d.edge([(560,590),(705,590)],arrow=True)
d.relationship(1080,590,"on")
d.edge([(995,590),(895,590)],arrow=True)
d.edge([(1255,590),(1165,590)],total=True)
d.relationship(1330,330,"authored")
d.edge([(1245,330),(895,190)],arrow=True)
d.edge([(1350,555),(1350,364)],total=True)
d.relationship(1550,360,"replies to")
d.edge([(1445,565),(1550,565),(1550,405)])
d.text(1510,540,"reply",size=19)
d.edge([(1635,360),(1700,360),(1700,610),(1445,610)],arrow=True)
d.text(1610,642,"original",size=19)
d.relationship(800,800,"filed under")
d.edge([(800,625),(800,755)],total=True)
d.edge([(800,845),(800,885)],arrow=True)
d.text(1040,995,"A comment's author must participate in that same post: composite FK.",size=19)
d.save("forum-chen.svg", "Dashed underline = weak entity partial key. post_image is identified by (post_id, position). Selected attributes only.")

# View 2: binary role projections make both conversation-to-user dependencies explicit.
d = Diagram("Private conversation contexts", "One conversation has one starter and one recipient; a post context is optional. Selected attributes only.",1180)
for x,y,name in [(300,250,"user"),(1250,450,"conversation"),(300,800,"message"),(1500,900,"post")]:
    d.entity(x,y,name)
d.relationship(780,250,"starter")
d.edge([(695,250),(395,250)],arrow=True)
d.edge([(1250,415),(1250,250),(865,250)],total=True)
d.relationship(780,450,"recipient")
d.edge([(695,450),(395,270)],arrow=True)
d.edge([(1155,450),(865,450)],total=True)
d.text(1510,330,"starter_id != recipient_id",size=19)
d.relationship(300,520,"sent")
d.edge([(300,475),(300,285)],arrow=True)
d.edge([(300,765),(300,565)],total=True)
d.relationship(780,800,"in")
d.edge([(395,800),(695,800)],total=True)
d.edge([(865,800),(1250,485)],arrow=True)
d.relationship(1500,650,"started from")
d.edge([(1345,470),(1500,605)])
d.edge([(1500,695),(1500,865)],arrow=True)
d.text(1670,760,"optional",size=19)
d.text(1670,788,"post context",size=19)
for x,y,name,rx in [(120,405,"user_id",100),(1510,430,"conversation_id",145),(300,940,"message_id",115),(1500,1030,"post_id",105)]:
    d.attribute(x,y,name,key=True,rx=rx)
d.edge([(205,270),(120,374)])
d.edge([(1345,430),(1365,430)])
d.edge([(300,835),(300,909)])
d.edge([(1500,935),(1500,999)])
d.text(640,625,"Post context: Host / alias / Visitor.",size=19)
d.text(640,657,"Public context: handle may be shown.",size=19)
d.text(640,689,"Sender must be a conversation member (trigger).",size=19)
d.save("messaging-chen.svg", "Starter/recipient are the two role projections of 'between'. Anonymity is a display rule, not an absent user FK.")

# View 3: the actual organizer FK points to users; application roles restrict its domain.
d = Diagram("Accounts, roles and event tickets", "A university domain is multivalued; roles are a partial, disjoint specialization. Tickets are a relationship set.",1280)
d.entity(250,220,"university")
d.entity(900,220,"user")
d.entity(620,590,"organization")
d.entity(1100,590,"admin")
d.entity(900,970,"event")
d.relationship(550,220,"studies at")
d.edge([(805,220),(635,220)],total=True)
d.edge([(465,220),(345,220)],arrow=True)
d.attribute(250,125,"university_id",key=True,rx=130)
d.edge([(250,185),(250,156)])
d.attribute(200,380,"domain",multi=True)
d.edge([(225,255),(200,349)])
d.attribute(1190,150,"user_id",key=True)
d.edge([(995,195),(1100,165)])
d.nodes.append('<polygon points="900,355 820,465 980,465"/>')
d.text(900,425,"ISA",size=24,bold=True)
d.edge([(900,255),(900,355)])
d.edge([(845,465),(620,555)])
d.edge([(955,465),(1100,555)])
d.text(1120,395,"Partial, disjoint",size=21,bold=True)
d.text(1190,433,"A student is in neither subtype.",size=19)
d.attribute(620,720,"display_name",rx=125)
d.edge([(620,625),(620,689)])
d.relationship(1450,590,"organizes")
d.edge([(1450,545),(1450,240),(995,240)],arrow=True)
d.edge([(995,970),(1450,635)],total=True)
d.text(1530,760,"Organizer is an organization or admin.",size=19)
d.text(1530,791,"Role check in application; FK to users.",size=19)
d.relationship(500,970,"holds ticket")
d.edge([(870,255),(870,300),(430,300),(430,850),(500,925)])
d.edge([(805,970),(585,970)])
d.attribute(240,850,"ticket_code",rx=115)
d.attribute(240,1060,"booked_at",rx=115)
d.attribute(500,1110,"checked_in_at",rx=135)
d.edge([(355,850),(415,970)])
d.edge([(355,1060),(415,970)])
d.edge([(500,1015),(500,1079)])
d.attribute(900,815,"event_id",key=True)
d.edge([(900,935),(900,846)])
d.attribute(1110,1090,"tickets_left",derived=True,rx=120)
d.edge([(995,995),(1040,1065)])
d.text(1410,1115,"Derived inventory is deliberately stored",size=18)
d.text(1410,1142,"for the atomic booking transaction.",size=18)
d.save("accounts-events-chen.svg", "Double ellipse = multivalued; dashed ellipse = derived. Tickets map to the user/event key plus relationship attributes.")
