# ฉากพื้นหลัง 3D ของเว็บ Super GameDev Camp — สร้างและจัดวางทั้งหมดใน Blender
#   รัน:  blender -b -P tools/blender/build_bg.py        (หรือ  python3 tools/blender/build_bg.py  ถ้าติดตั้ง bpy)
#   ผลลัพธ์:
#     tools/blender/bg-scene.blend      ไฟล์ Blender เปิดแก้/จัดฉากต่อได้
#     superdev/assets/3d/bg.bin + bg.json   โมเดลแบบย่อขนาดสำหรับเว็บ (three.js อ่านใน assets/bg3d.js)
# พิกัดใน Blender: X ขวา, Y ลึกเข้าจอ, Z ขึ้น — กล้องอยู่ด้านหน้า (Y ติดลบ) แล้วเลื่อนลงตามแกน Z เมื่อเลื่อนหน้าเว็บ
import bpy, bmesh, math, json, struct, os, random
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT_DIR = os.path.join(ROOT, 'superdev', 'assets', '3d')
random.seed(7)
R = math.radians

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
COL_LEN = 40  # กล้องเลื่อนลงตั้งแต่ z=0 ถึง z=-COL_LEN ตลอดความยาวหน้าเว็บ

# ── วัสดุ (สีโทนเดียวกับเว็บ) ──
WEB = {}
def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
def mat(name, col, e=0.0, r=0.55, m=0.0):
    if name in bpy.data.materials: return bpy.data.materials[name]
    mt = bpy.data.materials.new(name)
    try: mt.use_nodes = True
    except Exception: pass
    b = mt.node_tree.nodes.get('Principled BSDF')
    c = lin(col)
    b.inputs['Base Color'].default_value = (*c, 1)
    b.inputs['Roughness'].default_value = r
    b.inputs['Metallic'].default_value = m
    if e:
        b.inputs['Emission Color'].default_value = (*c, 1)
        b.inputs['Emission Strength'].default_value = e * 3
    mt.diffuse_color = (*c, 1)
    WEB[name] = {'color': col, 'e': e, 'r': r, 'm': m}
    return mt

M = {
    'lilac': mat('lilac', '#ece6ff', r=0.45), 'white': mat('white', '#fbf9ff', r=0.35),
    'ink': mat('ink', '#231848', r=0.5), 'dark': mat('dark', '#16102f', r=0.4),
    'purple': mat('purple', '#7c4dff', r=0.45), 'violet': mat('violet', '#a98bff', r=0.45),
    'pink': mat('pink', '#ff7cc0', r=0.45), 'gold': mat('gold', '#ffc83d', r=0.35, m=0.2),
    'cyan': mat('cyan', '#6fe6ff', r=0.4), 'mint': mat('mint', '#6dffb0', r=0.45),
    'cyanGlow': mat('cyanGlow', '#6fe6ff', e=1.0), 'pinkGlow': mat('pinkGlow', '#ff7cc0', e=1.0),
    'goldGlow': mat('goldGlow', '#ffd25e', e=1.0), 'screen': mat('screen', '#1c2470', e=0.55),
    'portal': mat('portal', '#8a5cff', e=1.0), 'ring': mat('ring', '#9f86ff', e=0.35),
    'rock': mat('rock', '#4b3a92', r=0.8), 'rock2': mat('rock2', '#33296e', r=0.8),
    'planetA': mat('planetA', '#ff8fcf', r=0.6), 'planetB': mat('planetB', '#5ed6ff', r=0.6),
    'planetC': mat('planetC', '#ffb85c', r=0.6), 'starGlow': mat('starGlow', '#fff2b3', e=1.0),
}

# ── ชิ้นส่วนพื้นฐาน ──
def group(name, kind, loc=(0, 0, 0), rot=(0, 0, 0), s=1.0, **meta):
    g = bpy.data.objects.new(name, None)
    scene.collection.objects.link(g)
    g.location = loc; g.rotation_euler = Euler([R(a) for a in rot]); g.scale = (s, s, s)
    g.empty_display_size = 1.5
    g['kind'] = kind
    for k, v in meta.items(): g[k] = v
    return g

def _finish(o, parent, m, loc, rot, bevel, seg):
    o.location = loc; o.rotation_euler = Euler([R(a) for a in rot])
    o.parent = parent
    o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new('Bevel', 'BEVEL'); bv.width = bevel; bv.segments = seg
        bv.limit_method = 'ANGLE'; bv.angle_limit = R(40)
    return o

def box(parent, m, size, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0, seg=3, cuts=0):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.data.transform(Matrix.Diagonal((*size, 1)))
    if cuts:
        bm = bmesh.new(); bm.from_mesh(o.data)
        vert = [e for e in bm.edges if abs((e.verts[0].co - e.verts[1].co).normalized().z) > 0.9]
        bmesh.ops.subdivide_edges(bm, edges=vert, cuts=cuts, use_grid_fill=True)
        bm.to_mesh(o.data); bm.free()
    return _finish(o, parent, m, loc, rot, bevel, seg)

def cyl(parent, m, r, h, loc=(0, 0, 0), rot=(0, 0, 0), n=24, bevel=0.0, seg=2, r2=None):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h)
    else: bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=r2, depth=h)
    return _finish(bpy.context.active_object, parent, m, loc, rot, bevel, seg)

def sph(parent, m, r, loc=(0, 0, 0), rot=(0, 0, 0), sc=(1, 1, 1), n=24, cut=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=max(8, n // 2), radius=r)
    o = bpy.context.active_object
    o.data.transform(Matrix.Diagonal((*sc, 1)))
    if cut is not None:  # ตัดก้นให้แบน
        bm = bmesh.new(); bm.from_mesh(o.data)
        res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, cut), plane_no=(0, 0, 1), clear_inner=True)
        edges = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
        bmesh.ops.edgeloop_fill(bm, edges=edges)
        bm.to_mesh(o.data); bm.free()
    return _finish(o, parent, m, loc, rot, 0, 0)

def ico(parent, m, r, loc=(0, 0, 0), sub=1, jitter=0.0):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r)
    o = bpy.context.active_object
    if jitter:
        for v in o.data.vertices: v.co *= 1 + random.uniform(-jitter, jitter)
    return _finish(o, parent, m, loc, (random.uniform(0, 90), random.uniform(0, 90), 0), 0, 0)

def torus(parent, m, R1, r1, loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R1, minor_radius=r1, major_segments=48, minor_segments=6)
    return _finish(bpy.context.active_object, parent, m, loc, rot, 0, 0)

def tube(parent, m, pts, r, closed=False):
    cu = bpy.data.curves.new('tube', 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = r; cu.bevel_resolution = 1; cu.resolution_u = 5
    sp = cu.splines.new('NURBS'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    sp.use_endpoint_u = True; sp.order_u = 4; sp.use_cyclic_u = closed
    o = bpy.data.objects.new('tube', cu); scene.collection.objects.link(o)
    o.parent = parent; o.data.materials.append(m)
    return o

def orbit(g, R1, tilt, moons=2, m='ring'):
    """วงแหวนดาวเคราะห์ + ดวงจันทร์เล็ก ๆ ทำให้ของแต่ละชิ้นอ่านออกว่าเป็น 'ดาว'"""
    torus(g, M[m], R1, 0.05, rot=tilt)
    rot = Euler([R(a) for a in tilt]).to_matrix()
    for i in range(moons):
        a = 2.1 + i * 2.4
        p = rot @ Vector((math.cos(a) * R1, math.sin(a) * R1, 0))
        sph(g, M[['cyan', 'pink', 'gold'][i % 3]], 0.16 + 0.05 * i, loc=p, n=10)

# ── โมเดลอุปกรณ์เกม ──
def monitor(name, loc, rot, s):
    g = group(name, 'portal', loc, rot, s, spin=0.0, bob=0.18)
    box(g, M['lilac'], (3.4, 2.2, 2.8), (0, 0.8, 0.1), bevel=0.32)
    box(g, M['lilac'], (2.6, 1.4, 2.1), (0, 2.2, 0.05), bevel=0.4)
    box(g, M['ink'], (3.0, 0.3, 2.4), (0, -0.3, 0.15), bevel=0.14)
    box(g, M['portal'], (2.55, 0.1, 1.95), (0, -0.42, 0.15), bevel=0.05)
    sph(g, M['goldGlow'], 0.09, (1.2, -0.42, -0.85), n=12)
    for i, c in enumerate(('pink', 'cyan')): cyl(g, M[c], 0.08, 0.1, (0.75 + i * 0.22, -0.42, -0.85), (90, 0, 0), n=12)
    cyl(g, M['violet'], 0.45, 0.6, (0, 0.9, -1.55))
    box(g, M['lilac'], (2.4, 1.9, 0.26), (0, 0.9, -1.95), bevel=0.12)
    box(g, M['white'], (2.1, 0.8, 0.12), (0, -0.6, -1.95), (8, 0, 0), bevel=0.05)  # คีย์บอร์ดเล็ก
    for i in range(6): box(g, M['violet'], (0.24, 0.5, 0.06), (-0.75 + i * 0.3, -0.62, -1.88), (8, 0, 0), bevel=0.02)
    tube(g, M['dark'], [(0.9, 2.6, -1.0), (1.5, 3.2, -1.6), (1.2, 3.6, -2.4), (2.2, 3.4, -2.8)], 0.06)
    orbit(g, 3.3, (14, 8, 25))
    return g

def console(name, loc, rot, s):
    g = group(name, 'planet', loc, rot, s, spin=0.25, bob=0.22)
    box(g, M['dark'], (0.6, 2.5, 4.0), bevel=0.08)
    for sx in (-1, 1):
        w = box(g, M['white'], (0.26, 2.8, 4.5), (sx * 0.45, 0, 0), bevel=0.11, cuts=8)
        for v in w.data.vertices:  # ปีกโค้งบานออกด้านบนแบบคอนโซลยุคใหม่
            t = (v.co.z + 2.25) / 4.5
            v.co.x += sx * 0.42 * t ** 2
            v.co.y *= 1 - 0.12 * (1 - t)
        box(g, M['cyanGlow'], (0.06, 2.55, 4.05), (sx * 0.31, 0, 0))
    box(g, M['ink'], (0.62, 0.04, 0.5), (0, -1.26, 1.2))
    for i in range(2): cyl(g, M['cyanGlow'], 0.05, 0.05, (0, -1.27, 0.5 - i * 0.25), (90, 0, 0), n=12)
    cyl(g, M['dark'], 0.95, 0.16, (0, 0, -2.3), bevel=0.05)
    orbit(g, 3.4, (-12, -10, -15), 2)
    return g

def mouse(name, loc, rot, s):
    g = group(name, 'planet', loc, rot, s, spin=0.3, bob=0.25)
    sph(g, M['white'], 1.0, (0, 0, 0), sc=(1.0, 1.55, 0.6), n=26, cut=-0.16)
    box(g, M['violet'], (0.06, 1.1, 0.5), (0, -0.85, 0.3))
    cyl(g, M['pinkGlow'], 0.2, 0.16, (0, -0.72, 0.5), (0, 90, 0), n=20, bevel=0.03)
    for sx in (-1, 1): box(g, M['violet'], (0.08, 0.6, 0.14), (sx * 0.98, -0.1, 0.0), bevel=0.03)
    sph(g, M['cyanGlow'], 0.07, (0, 0.95, 0.3), n=12)
    tube(g, M['purple'], [(0, 1.5, 0), (0.2, 2.4, 0.2), (-0.5, 3.0, 0.5), (-0.2, 3.8, 0.2), (0.6, 4.3, 0.6)], 0.07)
    orbit(g, 2.6, (-50, 10, 40), 2)
    return g

def gamepad(name, loc, rot, s):
    g = group(name, 'planet', loc, rot, s, spin=0.28, bob=0.24)
    box(g, M['purple'], (2.8, 0.9, 1.35), (0, 0, 0.1), bevel=0.42, seg=4)
    for sx in (-1, 1): sph(g, M['purple'], 0.62, (sx * 1.15, 0.0, -0.55), (0, sx * -24, 0), sc=(0.95, 0.72, 1.35), n=24)
    box(g, M['dark'], (0.62, 0.2, 0.2), (-0.85, -0.42, 0.2), bevel=0.04)
    box(g, M['dark'], (0.2, 0.2, 0.62), (-0.85, -0.42, 0.2), bevel=0.04)
    for (dx, dz), c in zip(((0, 0.27), (0.27, 0), (0, -0.27), (-0.27, 0)), ('cyanGlow', 'pinkGlow', 'goldGlow', 'mint')):
        cyl(g, M[c], 0.13, 0.16, (0.85 + dx, -0.42, 0.2 + dz), (90, 0, 0), n=16, bevel=0.03)
    for sx in (-1, 1):
        cyl(g, M['dark'], 0.18, 0.3, (sx * 0.42, -0.45, -0.32), (90, 0, 0), n=18)
        cyl(g, M['ink'], 0.27, 0.12, (sx * 0.42, -0.62, -0.32), (90, 0, 0), n=20, bevel=0.04)
    box(g, M['cyanGlow'], (0.5, 0.06, 0.08), (0, -0.46, 0.55), bevel=0.02)
    orbit(g, 2.9, (8, -10, -30), 3)
    return g

def tablet(name, loc, rot, s):
    g = group(name, 'planet', loc, rot, s, spin=0.22, bob=0.2)
    box(g, M['violet'], (2.5, 0.2, 3.3), bevel=0.2)
    box(g, M['screen'], (2.2, 0.06, 3.0), (0, -0.1, 0), bevel=0.04)
    cols = ('pinkGlow', 'cyanGlow', 'goldGlow', 'mint', 'purple', 'white')
    for i in range(12):
        x, z = i % 3, i // 3
        box(g, M[cols[(i * 5) % 6]], (0.44, 0.07, 0.44), (-0.62 + x * 0.62, -0.15, 1.0 - z * 0.62), bevel=0.1)
    box(g, M['white'], (0.9, 0.05, 0.08), (0, -0.15, -1.32), bevel=0.02)
    cyl(g, M['gold'], 0.08, 2.6, (1.55, -0.05, 0.1), (0, 8, 0), n=12)
    cyl(g, M['dark'], 0.08, 0.3, (1.55 - 0.03, -0.05, -1.35), (0, 8 + 180, 0), n=12, r2=0.0)
    orbit(g, 2.8, (16, 15, 20), 2)
    return g

def laptop(name, loc, rot, s):
    g = group(name, 'planet', loc, rot, s, spin=0.2, bob=0.2)
    box(g, M['lilac'], (3.0, 2.0, 0.18), (0, 0, 0), bevel=0.08)
    box(g, M['ink'], (2.6, 1.0, 0.04), (0, -0.2, 0.1), bevel=0.02)
    for r_ in range(3):
        for c_ in range(9): box(g, M['white'], (0.22, 0.24, 0.05), (-1.12 + c_ * 0.28, -0.55 + r_ * 0.32, 0.12), bevel=0.03)
    box(g, M['violet'], (0.9, 0.5, 0.03), (0, -0.85 + 0.5, 0.1))
    lid = group(name + '-lid', 'part'); lid.parent = g; lid.location = (0, 1.0, 0.1); lid.rotation_euler = (R(-12), 0, 0)
    box(lid, M['lilac'], (3.0, 0.14, 2.0), (0, 0, 1.0), bevel=0.08)
    box(lid, M['screen'], (2.7, 0.04, 1.7), (0, -0.08, 1.0))
    for i, (w, c) in enumerate(((1.6, 'pinkGlow'), (1.1, 'cyanGlow'), (1.9, 'goldGlow'), (0.8, 'cyanGlow'), (1.4, 'mint'))):
        box(lid, M[c], (w, 0.03, 0.12), (-1.15 + w / 2 + (i % 2) * 0.25, -0.11, 1.6 - i * 0.28))
    orbit(g, 2.9, (-10, 0, -20), 2)
    return g

def mini_planet(name, loc, r, m, ring=True):
    g = group(name, 'planet', loc, (random.uniform(-20, 20), 0, random.uniform(0, 40)), 1, spin=0.1, bob=0.12)
    sph(g, M[m], r, n=28)
    sph(g, M['white'], r * 0.25, (r * 0.45, -r * 0.7, r * 0.45), sc=(1, 0.3, 0.7), n=16)  # หลุมจุดสว่าง
    if ring: torus(g, M['ring'], r * 1.7, r * 0.06, rot=(16, 12, 0))
    return g

def loco():
    g = group('train-loco', 'train-loco', (0, 0, 0))
    cyl(g, M['purple'], 0.5, 1.8, (0, -0.25, 0.62), (90, 0, 0), n=28, bevel=0.06)
    for y in (-0.7, 0.0): cyl(g, M['gold'], 0.53, 0.1, (0, y, 0.62), (90, 0, 0), n=28)
    cyl(g, M['gold'], 0.52, 0.14, (0, -1.18, 0.62), (90, 0, 0), n=28, bevel=0.04)
    sph(g, M['goldGlow'], 0.17, (0, -1.27, 0.86), n=16)
    cyl(g, M['dark'], 0.16, 0.55, (0, -0.8, 1.25), n=16)
    cyl(g, M['gold'], 0.26, 0.2, (0, -0.8, 1.58), n=16, r2=0.16)
    box(g, M['lilac'], (1.15, 1.0, 1.35), (0, 0.95, 0.85), bevel=0.12)
    box(g, M['purple'], (1.35, 1.25, 0.16), (0, 0.95, 1.58), bevel=0.06)
    for sx in (-1, 1): box(g, M['cyanGlow'], (0.04, 0.5, 0.4), (sx * 0.58, 0.95, 1.05), bevel=0.02)
    box(g, M['dark'], (1.0, 2.8, 0.3), (0, 0.15, 0.08), bevel=0.05)
    box(g, M['gold'], (1.0, 0.35, 0.35), (0, -1.5, 0.1), (35, 0, 0), bevel=0.04)
    for sx in (-1, 1):
        for y in (-0.85, 0.0, 0.85):
            cyl(g, M['dark'], 0.3, 0.12, (sx * 0.55, y, 0.02), (0, 90, 0), n=20)
            cyl(g, M['gold'], 0.1, 0.14, (sx * 0.56, y, 0.02), (0, 90, 0), n=12)
    cyl(g, M['cyanGlow'], 0.22, 0.4, (0, 1.6, 0.85), (-90, 0, 0), n=16, r2=0.08)  # ไอพ่นท้าย
    return g

def car(name='train-car'):
    g = group(name, 'train-car', (0, 0, 0))
    box(g, M['white'], (1.15, 2.2, 1.05), (0, 0, 0.72), bevel=0.2)
    box(g, M['purple'], (1.19, 2.22, 0.14), (0, 0, 0.5))
    for sx in (-1, 1):
        for y in (-0.65, 0.0, 0.65): box(g, M['cyanGlow'], (0.05, 0.42, 0.36), (sx * 0.57, y, 0.88), bevel=0.04)
    box(g, M['purple'], (1.25, 2.3, 0.16), (0, 0, 1.3), bevel=0.07)
    box(g, M['dark'], (1.0, 2.3, 0.28), (0, 0, 0.1), bevel=0.05)
    for sx in (-1, 1):
        for y in (-0.7, 0.7): cyl(g, M['dark'], 0.26, 0.12, (sx * 0.55, y, 0.02), (0, 90, 0), n=18)
    return g

# ── จัดฉาก ──
DEVICES = []
mon = monitor('monitor', (-11.4, 1.5, -4.2), (4, 0, 30), 1.05)
console('console', (12.8, 3.0, -10.5), (10, -8, -24), 0.95)
gamepad('gamepad', (-12.4, 0.0, -16.0), (14, 22, -16), 1.0)
mouse('mouse', (12.6, 0.0, -21.0), (62, 18, 32), 1.0)
tablet('tablet', (-12.9, 2.0, -26.5), (6, -16, 18), 1.0)
laptop('laptop', (12.5, 1.0, -32.0), (24, 6, -26), 1.0)
gamepad('gamepad-far', (17.5, 13.0, -37.5), (10, -20, 20), 1.3)
console('console-far', (-18.0, 14.0, -39.0), (8, 10, 18), 1.3)
mini_planet('planet-pink', (7.0, 18.0, -6.0), 1.8, 'planetA')
mini_planet('planet-blue', (-6.0, 20.0, -21.0), 2.4, 'planetB')
mini_planet('planet-gold', (5.0, 19.0, -34.0), 1.6, 'planetC')
mini_planet('planet-small', (-15.5, 9.0, -12.5), 0.8, 'planetB', ring=False)
mini_planet('planet-small2', (16.0, 8.0, -28.0), 0.7, 'planetA', ring=False)

DEVICES = [o for o in scene.objects if o.type == 'EMPTY' and o.get('kind') in ('planet', 'portal')]
for i in range(34):  # หินอวกาศ: ฝั่งซ้าย/ขวาเมื่ออยู่ใกล้ เพื่อไม่บังตัวหนังสือ
    y = random.uniform(-4, 16)
    edge = 9 + y * 0.55
    while True:
        x = random.choice((-1, 1)) * random.uniform(edge, edge + 6); z = random.uniform(2, -46)
        if all((Vector((x, y, z)) - d.location).length > 5 for d in DEVICES): break
    g = group(f'rock-{i}', 'rock', (x, y, z), (0, 0, 0), 1, spin=random.uniform(0.1, 0.5), bob=0.1)
    ico(g, M['rock' if i % 3 else 'rock2'], random.uniform(0.25, 0.75), sub=1, jitter=0.18)
for i in range(46):
    y = random.uniform(-2, 22)
    g = group(f'star-{i}', 'star', (random.uniform(-24, 24), y, random.uniform(3, -47)), (0, 0, 0), 1, spin=0.6, bob=0.05)
    ico(g, M['starGlow'], random.uniform(0.07, 0.16), sub=0)

# ── เส้นทางรถไฟ: ออกจากหน้าจอคอม โค้งผ่านทุกดาวลงไปจนสุดหน้า แล้ววนกลับขึ้นมาด้านหลังเข้าทางหลังจอ ──
bpy.context.view_layer.update(); mw = mon.matrix_world.copy()
def at_mon(p): return tuple(mw @ Vector(p))
CTRL = [
    at_mon((0, 3.0, 0.15)), at_mon((0, -0.4, 0.15)), at_mon((0.6, -2.6, 0.2)),
    (-2.0, -2.0, -7.5), (5.0, 0.5, -9.0), (9.0, -1.5, -13.5), (3.0, 3.0, -15.5),
    (-6.0, -2.5, -18.0), (-8.0, 4.0, -21.5), (2.0, 5.0, -22.5), (8.5, 1.5, -25.0),
    (6.0, -3.0, -28.5), (-4.0, 2.0, -30.0), (-9.0, -1.0, -33.5), (-2.0, 4.0, -37.0),
    (7.0, 1.0, -40.0), (4.0, 6.0, -44.5), (-6.0, 12.0, -46.0), (-14.0, 18.0, -38.0),
    (-6.0, 24.0, -26.0), (6.0, 26.0, -16.0), (2.0, 20.0, -6.0), (-6.0, 12.0, -1.0),
    at_mon((0, 8.0, 0.4)),
]
# ช่วงกลางจอดันรางลึกเข้าไปอีก รถไฟจะได้ไม่ใหญ่บังตัวหนังสือ
CTRL = CTRL[:3] + [(x, y + (4.5 if abs(x) < 8 else 2.5), z) for x, y, z in CTRL[3:17]] + CTRL[17:]
def catmull(pts, n=10):
    out = []; L = len(pts)
    for i in range(L):
        p0, p1, p2, p3 = (Vector(pts[(i + k) % L]) for k in (-1, 0, 1, 2))
        for s in range(n):
            t = s / n; t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return out
PATH = catmull(CTRL, 12)
cu = bpy.data.curves.new('train-path', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.05
sp = cu.splines.new('POLY'); sp.points.add(len(PATH) - 1); sp.use_cyclic_u = True
for p, c in zip(sp.points, PATH): p.co = (*c, 1)
rail = bpy.data.objects.new('train-path', cu); scene.collection.objects.link(rail); rail.data.materials.append(M['cyanGlow'])

# ขบวนรถไฟวางบนราง (แม่แบบ — เว็บจะโคลนแล้ววิ่งตามรางเอง)
ACC = [0.0]
for i in range(1, len(PATH)): ACC.append(ACC[-1] + (PATH[i] - PATH[i - 1]).length)
def place(g, dist):
    i = max(k for k in range(len(PATH)) if ACC[k] <= dist)
    a, b = PATH[i], PATH[(i + 1) % len(PATH)]
    g.location = a + (b - a).normalized() * (dist - ACC[i])
    g.rotation_euler = (b - a).to_track_quat('-Y', 'Z').to_euler()
HEAD = ACC[40]
place(loco(), HEAD)
for k, nm in enumerate(('train-car', 'train-car-2', 'train-car-3')):
    c = car(nm); place(c, HEAD - 2.75 - 2.55 * k)
    if k: c['kind'] = 'train-car-copy'

# ── กล้อง/แสงสำหรับดูใน Blender (เว็บใช้แสงของตัวเอง) ──
cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('Camera')); scene.collection.objects.link(cam)
cam.location = (0, -16, -6); cam.rotation_euler = (R(90), 0, 0); cam.data.sensor_fit = 'HORIZONTAL'
cam.data.angle = 2 * math.atan(12 / 16)
scene.camera = cam
cam.animation_data_create()
scene.frame_start, scene.frame_end = 1, 200
cam.location.z = 0; cam.keyframe_insert('location', frame=1)
cam.location.z = -COL_LEN; cam.keyframe_insert('location', frame=200)
for nm, e, rot, en in (('Key', 'SUN', (55, 0, 35), 3.0), ('Rim', 'SUN', (-60, 0, 200), 2.0)):
    L = bpy.data.objects.new(nm, bpy.data.lights.new(nm, e)); L.data.energy = en
    L.rotation_euler = [R(a) for a in rot]; scene.collection.objects.link(L)
w = bpy.data.worlds.new('Space'); scene.world = w
try: w.use_nodes = True
except Exception: pass
w.node_tree.nodes['Background'].inputs[0].default_value = (*lin('#0b0628'), 1)

# ── อบโมดิฟายเออร์เป็นเมช + ขอบคม/มนตามมุม (ทั้งไฟล์ .blend และเว็บได้รูปทรงเดียวกัน) ──
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
for o in [o for o in scene.objects if o.type in ('MESH', 'CURVE') and o.name != 'train-path']:
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    bm = bmesh.new(); bm.from_mesh(me)
    for f in bm.faces: f.smooth = True
    for e in bm.edges:
        e.smooth = not (len(e.link_faces) != 2 or e.calc_face_angle(0) > R(38))
    bm.to_mesh(me); bm.free()
    if o.type == 'CURVE':
        n = bpy.data.objects.new(o.name, me); scene.collection.objects.link(n)
        n.parent = o.parent; n.matrix_parent_inverse = o.matrix_parent_inverse.copy(); n.matrix_basis = o.matrix_basis.copy()
        bpy.data.objects.remove(o)
    else:
        o.modifiers.clear(); o.data = me
bpy.context.view_layer.update()

# ── ส่งออกสำหรับเว็บ: พิกัด three.js (Y ขึ้น, Z ออกมาหาคน) ──
C = Matrix(((1, 0, 0, 0), (0, 0, 1, 0), (0, -1, 0, 0), (0, 0, 0, 1)))
CI = C.inverted()
def descendants(o):
    for ch in o.children:
        yield ch
        yield from descendants(ch)
blob = bytearray(); meshes = []; groups = []; seen_tpl = {}
def pad4():
    while len(blob) % 4: blob.append(0)
for g in [o for o in scene.objects if o.type == 'EMPTY' and o.parent is None]:
    kind = g['kind']
    if kind == 'train-car-copy': continue
    inv = g.matrix_world.inverted()
    by_mat = {}
    for ch in descendants(g):
        if ch.type != 'MESH': continue
        me = ch.data; me.calc_loop_triangles()
        rel = C @ inv @ ch.matrix_world  # จากพิกัดชิ้นส่วน → พิกัดของกลุ่ม ในแกน three
        nrm = rel.to_3x3().inverted().transposed()
        cn = me.corner_normals
        mname = ch.active_material.name
        verts, idx, keymap = by_mat.setdefault(mname, ([], [], {}))
        for t in me.loop_triangles:
            for li, vi in zip(t.loops, t.vertices):
                p = rel @ me.vertices[vi].co
                n = (nrm @ cn[li].vector).normalized()
                k = (round(p.x, 4), round(p.y, 4), round(p.z, 4), round(n.x, 2), round(n.y, 2), round(n.z, 2))
                if k not in keymap: keymap[k] = len(verts); verts.append((p, n))
                idx.append(keymap[k])
    parts = []
    for mname, (verts, idx, _) in by_mat.items():
        lo = [min(v[0][a] for v in verts) for a in range(3)]; hi = [max(v[0][a] for v in verts) for a in range(3)]
        span = [max(h - l, 1e-6) for l, h in zip(lo, hi)]
        pad4(); po = len(blob)
        for p, _ in verts: blob.extend(struct.pack('<3H', *(round((p[a] - lo[a]) / span[a] * 65535) for a in range(3))))
        pad4(); no = len(blob)
        for _, n in verts: blob.extend(struct.pack('<3b', *(max(-127, min(127, round(n[a] * 127))) for a in range(3))))
        pad4(); io = len(blob)
        blob.extend(struct.pack(f'<{len(idx)}H', *idx))
        parts.append({'mat': mname, 'n': len(verts), 'i': len(idx), 'po': po, 'no': no, 'io': io, 'lo': lo, 'hi': hi})
        meshes.append(len(verts))
    mtx = C @ g.matrix_world @ CI
    groups.append({'name': g.name, 'kind': kind, 'spin': g.get('spin', 0), 'bob': g.get('bob', 0),
                   'm': [round(mtx[r][c], 5) for c in range(4) for r in range(4)], 'parts': parts})
path3 = [[round(v, 3) for v in (p.x, p.z, -p.y)] for p in PATH]
os.makedirs(OUT_DIR, exist_ok=True)
with open(os.path.join(OUT_DIR, 'bg.bin'), 'wb') as f: f.write(blob)
import gzip
with open(os.path.join(OUT_DIR, 'bg.bin.gz'), 'wb') as f: f.write(gzip.compress(bytes(blob), 9, mtime=0))  # เบราว์เซอร์ใหม่โหลดไฟล์บีบอัดนี้แทน
with open(os.path.join(OUT_DIR, 'bg.json'), 'w') as f:
    json.dump({'col': COL_LEN, 'materials': WEB, 'groups': groups, 'path': path3, 'cam': {'z': 16, 'halfW': 12}}, f, separators=(',', ':'))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'bg-scene.blend'), compress=True)
print('groups', len(groups), 'verts', sum(meshes), 'bytes', len(blob))
